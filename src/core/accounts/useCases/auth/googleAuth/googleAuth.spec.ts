import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { FakeGoogleTokenVerifier } from '@/shared/providers/googleAuth/fakes/FakeGoogleTokenVerifier';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ConflictError, UnauthorizedError } from '@/shared/error/error.lib';
import { VerifiedGoogleIdentity } from '@/shared/providers/googleAuth/googleAuth.dtos';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { Roles } from '@/shared/accessControl/roles';
import { IdentityProviderSubjectAlreadyExistsError } from '@/core/accounts/errors/identity.errors';
import { GoogleAuthService } from './GoogleAuth.service';

let usersRepository: IUsersRepository;
let identitiesRepository: IIdentitiesRepository;
let verifier: FakeGoogleTokenVerifier;
let service: GoogleAuthService;

const idToken = 'any-google-id-token';

const verifiedIdentity: VerifiedGoogleIdentity = {
	subject: 'google-sub-123',
	email: 'JaneDoe@example.com',
	isEmailVerified: true,
	givenName: 'Jane',
	familyName: 'Doe',
	pictureUrl: 'https://example.com/jane.png',
};

describe('GoogleAuth', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		verifier = new FakeGoogleTokenVerifier();
		service = new GoogleAuthService(verifier, usersRepository, identitiesRepository, new FakeTransactionManager());
	});

	it('signs in an existing linked identity', async () => {
		const user = await usersRepository.create({
			name: 'Jane',
			surname: 'Doe',
			email: 'janedoe@example.com',
			emailVerified: true,
			role: Roles.member,
			status: UserStatuses.active,
		});
		await identitiesRepository.create({
			userId: user.id,
			provider: IdentityProviders.google,
			providerSubject: verifiedIdentity.subject,
			email: 'janedoe@example.com',
			isEmailVerified: true,
		});
		verifier.setNextIdentity(verifiedIdentity);

		const result = await service.execute({ idToken });

		expect(result.user.id).toBe(user.id);
		expect(result.user.role).toBe(Roles.member);
		expect(result.user.status).toBe(UserStatuses.active);
		// No extra user was created.
		expect(usersRepository).toBeDefined();
	});

	it('rejects an identity whose user no longer exists', async () => {
		await identitiesRepository.create({
			userId: '000000000000000000000000',
			provider: IdentityProviders.google,
			providerSubject: verifiedIdentity.subject,
		});
		verifier.setNextIdentity(verifiedIdentity);

		await expect(service.execute({ idToken })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ idToken })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	it('rejects a token whose email is not verified before create/link', async () => {
		verifier.setNextIdentity({ ...verifiedIdentity, isEmailVerified: false });

		await expect(service.execute({ idToken })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ idToken })).rejects.toThrow('apiResponses.auth.googleEmailNotVerified');
	});

	it('requires explicit linking when a local account already uses the verified email', async () => {
		const existing = await usersRepository.create({
			name: 'Jane',
			surname: 'Doe',
			email: 'janedoe@example.com',
			emailVerified: true,
			role: Roles.partner,
			status: UserStatuses.active,
		});
		verifier.setNextIdentity(verifiedIdentity);

		await expect(service.execute({ idToken })).rejects.toBeInstanceOf(ConflictError);

		const linked = await identitiesRepository.findByProviderSub(IdentityProviders.google, verifiedIdentity.subject);
		expect(linked).toBeNull();
		expect((await usersRepository.findById(existing.id))?.status).toBe(UserStatuses.active);
	});

	it('creates a new active verified member and Google identity', async () => {
		verifier.setNextIdentity(verifiedIdentity);

		const result = await service.execute({ idToken });

		const created = await usersRepository.findByEmail('janedoe@example.com');
		expect(created).not.toBeNull();
		expect(result.user.id).toBe(created?.id);
		expect(created?.emailVerified).toBe(true);
		expect(created?.status).toBe(UserStatuses.active);
		expect(result.user.status).toBe(UserStatuses.active);
		expect(created?.role).toBe(Roles.member);
		expect(created?.avatarUrl).toBe(verifiedIdentity.pictureUrl);

		const identity = await identitiesRepository.findByProviderSub(
			IdentityProviders.google,
			verifiedIdentity.subject,
		);
		expect(identity).not.toBeNull();
		expect(identity?.userId).toBe(created?.id);
	});

	it('creates an incomplete profile without a surname when familyName is absent', async () => {
		const { familyName: _omitted, ...withoutFamily } = verifiedIdentity;
		verifier.setNextIdentity(withoutFamily);

		const result = await service.execute({ idToken });

		const created = await usersRepository.findByEmail('janedoe@example.com');
		expect(created?.status).toBe(UserStatuses.incomplete_profile);
		expect(created?.name).toBe('Jane');
		expect(created?.surname).toBeUndefined();
		expect(result.user.status).toBe(UserStatuses.incomplete_profile);
	});

	it('creates an incomplete profile without a name when givenName is absent', async () => {
		const { givenName: _omitted, ...withoutGiven } = verifiedIdentity;
		verifier.setNextIdentity(withoutGiven);

		const result = await service.execute({ idToken });

		const created = await usersRepository.findByEmail('janedoe@example.com');
		expect(created?.status).toBe(UserStatuses.incomplete_profile);
		expect(created?.name).toBeUndefined();
		expect(created?.surname).toBe('Doe');
		expect(result.user.status).toBe(UserStatuses.incomplete_profile);
	});

	it('rejects a verified Google token without an email', async () => {
		const { email: _omitted, ...withoutEmail } = verifiedIdentity;
		verifier.setNextIdentity(withoutEmail);

		await expect(service.execute({ idToken })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ idToken })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	it('recovers when another request creates the Google identity concurrently', async () => {
		const realCreate = identitiesRepository.create.bind(identitiesRepository);
		identitiesRepository.create = async (data) => {
			await realCreate(data);
			throw new IdentityProviderSubjectAlreadyExistsError();
		};
		verifier.setNextIdentity(verifiedIdentity);

		const result = await service.execute({ idToken });

		const identity = await identitiesRepository.findByProviderSub(
			IdentityProviders.google,
			verifiedIdentity.subject,
		);
		expect(identity).not.toBeNull();
		expect(result.user.id).toBe(identity?.userId);
	});

	it('rethrows a concurrent-identity error when the identity cannot be re-read', async () => {
		const raceError = new IdentityProviderSubjectAlreadyExistsError();
		identitiesRepository.create = vi.fn(async () => {
			throw raceError;
		});
		verifier.setNextIdentity(verifiedIdentity);

		await expect(service.execute({ idToken })).rejects.toBe(raceError);
	});

	it('rethrows a concurrent-identity error when the recovered identity is orphaned', async () => {
		await identitiesRepository.create({
			userId: 'missing-user',
			provider: IdentityProviders.google,
			providerSubject: verifiedIdentity.subject,
		});
		const realFind = identitiesRepository.findByProviderSub.bind(identitiesRepository);
		let firstLookup = true;
		identitiesRepository.findByProviderSub = async (provider, providerSubject) => {
			if (firstLookup) {
				firstLookup = false;
				return null;
			}
			return realFind(provider, providerSubject);
		};
		verifier.setNextIdentity(verifiedIdentity);

		await expect(service.execute({ idToken })).rejects.toBeInstanceOf(IdentityProviderSubjectAlreadyExistsError);
	});

	it('does not swallow non-concurrency errors while creating a Google account', async () => {
		const expectedError = new Error('Database unavailable');
		identitiesRepository.create = vi.fn(async () => {
			throw expectedError;
		});
		verifier.setNextIdentity(verifiedIdentity);

		await expect(service.execute({ idToken })).rejects.toBe(expectedError);
	});
});
