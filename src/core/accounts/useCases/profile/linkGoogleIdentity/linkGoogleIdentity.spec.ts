import { beforeEach, describe, expect, it } from 'vitest';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ConflictError, UnauthorizedError } from '@/shared/error/error.lib';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import { FakeGoogleIdentityProvider } from '@/shared/providers/googleAuth/fakes/FakeGoogleIdentityProvider';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { LinkGoogleIdentityService } from './LinkGoogleIdentity.service';
import { SessionVersionMarkerStoreInMemory } from '@/core/accounts/stores/inMemory/SessionVersionMarker.store';

let usersRepository: IUsersRepository;
let identitiesRepository: IIdentitiesRepository;
let googleIdentityProvider: FakeGoogleIdentityProvider;
let service: LinkGoogleIdentityService;

const seedAccount = () => usersRepository.create(createUserFactory({ email: 'local@example.com' }));

describe('Link Google Identity', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		googleIdentityProvider = new FakeGoogleIdentityProvider();
		service = new LinkGoogleIdentityService(
			usersRepository,
			identitiesRepository,
			googleIdentityProvider,
			new NativeDateProvider(),
			new FakeTransactionManager(),
			new SessionVersionMarkerStoreInMemory(),
		);
	});

	it('links a verified Google identity and revokes older sessions', async () => {
		const user = await seedAccount();

		const result = await service.execute({ userId: user.id, authorizationCode: 'token' });

		const identity = await identitiesRepository.findByProviderSub(IdentityProviders.google, 'fake-google-sub');
		expect(identity?.userId).toBe(user.id);
		expect(result.user.sessionVersion).toBe(user.sessionVersion + 1);
	});

	it('rejects an unverified Google identity', async () => {
		const user = await seedAccount();
		googleIdentityProvider.setNextIdentity({
			subject: 'fake-google-sub',
			isEmailVerified: false,
		});

		await expect(service.execute({ userId: user.id, authorizationCode: 'token' })).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
		expect(await identitiesRepository.listProvidersByUserId(user.id)).toEqual([]);
	});

	it('rejects a Google identity already owned by another user', async () => {
		const user = await seedAccount();
		await identitiesRepository.create({
			userId: '507f1f77bcf86cd799439012',
			provider: IdentityProviders.google,
			providerSubject: 'fake-google-sub',
		});

		await expect(service.execute({ userId: user.id, authorizationCode: 'token' })).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('rejects connecting a second Google identity to the same user', async () => {
		const user = await seedAccount();
		await identitiesRepository.create({
			userId: user.id,
			provider: IdentityProviders.google,
			providerSubject: 'another-google-sub',
		});

		await expect(service.execute({ userId: user.id, authorizationCode: 'token' })).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	describe('avatar', () => {
		const googlePicture = 'https://lh3.googleusercontent.com/a/picture';
		const identityWith = (pictureUrl?: string) => ({
			subject: 'fake-google-sub',
			email: 'local@example.com',
			isEmailVerified: true,
			...(pictureUrl === undefined ? {} : { pictureUrl }),
		});

		it('uses the picture of the Google account when the user has no avatar', async () => {
			const user = await seedAccount();
			googleIdentityProvider.setNextIdentity(identityWith(googlePicture));

			await service.execute({ userId: user.id, authorizationCode: 'token' });

			expect((await usersRepository.findById(user.id))?.avatarUrl).toBe(googlePicture);
		});

		it('keeps the avatar the user already has', async () => {
			const user = await usersRepository.create(
				createUserFactory({ email: 'local@example.com', avatarUrl: 'https://cdn.example.com/mine.png' }),
			);
			googleIdentityProvider.setNextIdentity(identityWith(googlePicture));

			await service.execute({ userId: user.id, authorizationCode: 'token' });

			expect((await usersRepository.findById(user.id))?.avatarUrl).toBe('https://cdn.example.com/mine.png');
		});

		it('leaves the user without an avatar when the Google account has no picture', async () => {
			const user = await seedAccount();
			googleIdentityProvider.setNextIdentity(identityWith());

			await service.execute({ userId: user.id, authorizationCode: 'token' });

			expect((await usersRepository.findById(user.id))?.avatarUrl).toBeUndefined();
		});

		it('treats an empty picture as no picture', async () => {
			const user = await seedAccount();
			googleIdentityProvider.setNextIdentity(identityWith(''));

			await service.execute({ userId: user.id, authorizationCode: 'token' });

			expect((await usersRepository.findById(user.id))?.avatarUrl).toBeUndefined();
		});

		it('still records the picture on the linked identity and revokes older sessions', async () => {
			const user = await seedAccount();
			googleIdentityProvider.setNextIdentity(identityWith(googlePicture));

			const result = await service.execute({ userId: user.id, authorizationCode: 'token' });

			const identity = await identitiesRepository.findByProviderSub(IdentityProviders.google, 'fake-google-sub');
			expect(identity?.pictureUrl).toBe(googlePicture);
			expect(result.user.sessionVersion).toBe(user.sessionVersion + 1);
		});

		it.each([['an unverified Google identity', { ...identityWith(googlePicture), isEmailVerified: false }]])(
			'does not take the picture from %s',
			async (_title, identity) => {
				const user = await seedAccount();
				googleIdentityProvider.setNextIdentity(identity);

				await expect(service.execute({ userId: user.id, authorizationCode: 'token' })).rejects.toBeInstanceOf(
					UnauthorizedError,
				);

				expect((await usersRepository.findById(user.id))?.avatarUrl).toBeUndefined();
			},
		);

		it('does not take the picture when the Google account belongs to another user', async () => {
			const user = await seedAccount();
			await identitiesRepository.create({
				userId: '507f1f77bcf86cd799439012',
				provider: IdentityProviders.google,
				providerSubject: 'fake-google-sub',
			});
			googleIdentityProvider.setNextIdentity(identityWith(googlePicture));

			await expect(service.execute({ userId: user.id, authorizationCode: 'token' })).rejects.toBeInstanceOf(
				ConflictError,
			);

			expect((await usersRepository.findById(user.id))?.avatarUrl).toBeUndefined();
		});
	});
});
