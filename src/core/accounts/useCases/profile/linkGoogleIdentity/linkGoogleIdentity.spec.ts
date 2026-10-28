import { beforeEach, describe, expect, it } from 'vitest';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ConflictError, UnauthorizedError } from '@/shared/error/error.lib';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import { FakeGoogleTokenVerifier } from '@/shared/providers/googleAuth/fakes/FakeGoogleTokenVerifier';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { LinkGoogleIdentityService } from './LinkGoogleIdentity.service';

let usersRepository: IUsersRepository;
let identitiesRepository: IIdentitiesRepository;
let verifier: FakeGoogleTokenVerifier;
let service: LinkGoogleIdentityService;

const seedAccount = () => usersRepository.create(createUserFactory({ email: 'local@example.com' }));

describe('LinkGoogleIdentityService', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		verifier = new FakeGoogleTokenVerifier();
		service = new LinkGoogleIdentityService(
			usersRepository,
			identitiesRepository,
			verifier,
			new NativeDateProvider(),
			new FakeTransactionManager(),
		);
	});

	it('links a verified Google identity and revokes older sessions', async () => {
		const user = await seedAccount();

		const result = await service.execute({ userId: user.id, idToken: 'token' });

		const identity = await identitiesRepository.findByProviderSub(IdentityProviders.google, 'fake-google-sub');
		expect(identity?.userId).toBe(user.id);
		expect(result.user.sessionVersion).toBe(user.sessionVersion + 1);
	});

	it('rejects an unverified Google identity', async () => {
		const user = await seedAccount();
		verifier.setNextIdentity({
			subject: 'fake-google-sub',
			isEmailVerified: false,
		});

		await expect(service.execute({ userId: user.id, idToken: 'token' })).rejects.toBeInstanceOf(UnauthorizedError);
		expect(await identitiesRepository.listProvidersByUserId(user.id)).toEqual([]);
	});

	it('rejects a Google identity already owned by another user', async () => {
		const user = await seedAccount();
		await identitiesRepository.create({
			userId: '507f1f77bcf86cd799439012',
			provider: IdentityProviders.google,
			providerSubject: 'fake-google-sub',
		});

		await expect(service.execute({ userId: user.id, idToken: 'token' })).rejects.toBeInstanceOf(ConflictError);
	});

	it('rejects connecting a second Google identity to the same user', async () => {
		const user = await seedAccount();
		await identitiesRepository.create({
			userId: user.id,
			provider: IdentityProviders.google,
			providerSubject: 'another-google-sub',
		});

		await expect(service.execute({ userId: user.id, idToken: 'token' })).rejects.toBeInstanceOf(ConflictError);
	});
});
