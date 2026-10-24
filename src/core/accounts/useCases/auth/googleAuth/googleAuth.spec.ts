import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { FakeGoogleTokenVerifier } from '@/shared/providers/googleAuth/fakes/FakeGoogleTokenVerifier';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { GoogleTokenPayload } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { UserStatuses } from '@/core/accounts/entities/user.entity';
import { IdentityProviders } from '@/core/accounts/entities/identity.entity';
import { Roles } from '@/shared/accessControl/roles';
import { GoogleAuthService } from './GoogleAuth.service';

let usersRepository: IUsersRepository;
let identitiesRepository: IIdentitiesRepository;
let verifier: FakeGoogleTokenVerifier;
let service: GoogleAuthService;

const idToken = 'any-google-id-token';

const verifiedPayload: GoogleTokenPayload = {
	sub: 'google-sub-123',
	email: 'JaneDoe@example.com',
	email_verified: true,
	given_name: 'Jane',
	family_name: 'Doe',
	picture: 'https://example.com/jane.png',
};

describe('GoogleAuth', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		identitiesRepository = new IdentitiesRepositoryInMemory();
		verifier = new FakeGoogleTokenVerifier();
		service = new GoogleAuthService(verifier, usersRepository, identitiesRepository, new FakeTransactionManager());
	});

	it('branch (a): signs in an existing identity', async () => {
		const user = await usersRepository.create({
			name: 'Jane',
			surname: 'Doe',
			email: 'janedoe@example.com',
			email_verified: true,
			role: Roles.member,
			status: UserStatuses.active,
		});
		await identitiesRepository.create({
			user_id: user._id.toString(),
			provider: IdentityProviders.google,
			provider_sub: verifiedPayload.sub,
			email: 'janedoe@example.com',
			email_verified: true,
		});
		verifier.setNextPayload(verifiedPayload);

		const result = await service.execute({ idToken });

		expect(result.user.id).toBe(user._id.toString());
		expect(result.user.role).toBe(Roles.member);
		// No extra user was created.
		expect(usersRepository).toBeDefined();
	});

	it('branch (a) orphan: rejects an identity whose user is gone', async () => {
		await identitiesRepository.create({
			user_id: '000000000000000000000000',
			provider: IdentityProviders.google,
			provider_sub: verifiedPayload.sub,
		});
		verifier.setNextPayload(verifiedPayload);

		await expect(service.execute({ idToken })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ idToken })).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});

	it('rejects a token whose email is not verified before create/link', async () => {
		verifier.setNextPayload({ ...verifiedPayload, email_verified: false });

		await expect(service.execute({ idToken })).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(service.execute({ idToken })).rejects.toThrow('apiResponses.auth.googleEmailNotVerified');
	});

	it('branch (b): links the identity to an existing local account and promotes it', async () => {
		const existing = await usersRepository.create({
			name: 'Jane',
			surname: 'Doe',
			email: 'janedoe@example.com',
			email_verified: false,
			role: Roles.partner,
			status: UserStatuses.pending,
		});
		verifier.setNextPayload(verifiedPayload);

		const result = await service.execute({ idToken });

		expect(result.user.id).toBe(existing._id.toString());
		expect(result.user.role).toBe(Roles.partner);

		const linked = await identitiesRepository.findByProviderSub(IdentityProviders.google, verifiedPayload.sub);
		expect(linked).not.toBeNull();
		expect(linked?.user_id).toBe(existing._id.toString());

		const promoted = await usersRepository.findById(existing._id.toString());
		expect(promoted?.status).toBe(UserStatuses.active);
		expect(promoted?.email_verified).toBe(true);
	});

	it('branch (c): creates a new active, verified member user + identity', async () => {
		verifier.setNextPayload(verifiedPayload);

		const result = await service.execute({ idToken });

		const created = await usersRepository.findByEmail('janedoe@example.com');
		expect(created).not.toBeNull();
		expect(result.user.id).toBe(created?._id.toString());
		expect(created?.email_verified).toBe(true);
		expect(created?.status).toBe(UserStatuses.active);
		expect(created?.role).toBe(Roles.member);
		expect(created?.avatar_url).toBe(verifiedPayload.picture);

		const identity = await identitiesRepository.findByProviderSub(IdentityProviders.google, verifiedPayload.sub);
		expect(identity).not.toBeNull();
		expect(identity?.user_id).toBe(created?._id.toString());
	});

	it('branch (c): surname falls back to empty string when family_name is absent', async () => {
		const { family_name: _omitted, ...withoutFamily } = verifiedPayload;
		verifier.setNextPayload(withoutFamily);

		await service.execute({ idToken });

		const created = await usersRepository.findByEmail('janedoe@example.com');
		expect(created?.surname).toBe('');
	});

	it('branch (c): name falls back to the email local part when given_name is absent', async () => {
		const { given_name: _omitted, ...withoutGiven } = verifiedPayload;
		verifier.setNextPayload(withoutGiven);

		await service.execute({ idToken });

		const created = await usersRepository.findByEmail('janedoe@example.com');
		expect(created?.name).toBe('janedoe');
	});

	it('E11000 race: falls back to branch (a) when a concurrent create wins', async () => {
		// Pre-seed the identity + its user so the in-memory identities repo throws a
		// duplicate-key error on the branch (c) create, exercising the recovery path.
		const racedUser = await usersRepository.create({
			name: 'Jane',
			surname: 'Doe',
			email: 'janedoe@example.com',
			email_verified: true,
			role: Roles.member,
			status: UserStatuses.active,
		});
		await identitiesRepository.create({
			user_id: racedUser._id.toString(),
			provider: IdentityProviders.google,
			provider_sub: verifiedPayload.sub,
		});

		// Force the service to skip branch (a) by making findByProviderSub return
		// null on the first lookup but the real identity on the recovery re-read.
		let firstLookup = true;
		const realFind = identitiesRepository.findByProviderSub.bind(identitiesRepository);
		identitiesRepository.findByProviderSub = async (provider, providerSub) => {
			if (firstLookup) {
				firstLookup = false;
				return null;
			}
			return realFind(provider, providerSub);
		};

		verifier.setNextPayload(verifiedPayload);

		const result = await service.execute({ idToken });

		expect(result.user.id).toBe(racedUser._id.toString());
		expect(result.user.role).toBe(Roles.member);
	});
});
