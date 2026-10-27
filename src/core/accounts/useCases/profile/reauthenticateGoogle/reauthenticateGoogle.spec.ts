import { beforeEach, describe, expect, it } from 'vitest';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import { FakeGoogleTokenVerifier } from '@/shared/providers/googleAuth/fakes/FakeGoogleTokenVerifier';
import { ReauthenticateGoogleService } from './ReauthenticateGoogle.service';

let identitiesRepository: IIdentitiesRepository;
let verifier: FakeGoogleTokenVerifier;
let dateProvider: IDateProvider;
let service: ReauthenticateGoogleService;

const userId = '507f1f77bcf86cd799439011';

describe('ReauthenticateGoogleService', () => {
	beforeEach(() => {
		identitiesRepository = new IdentitiesRepositoryInMemory();
		verifier = new FakeGoogleTokenVerifier();
		dateProvider = new NativeDateProvider();
		service = new ReauthenticateGoogleService(verifier, identitiesRepository, dateProvider);
	});

	it('accepts a valid token for the Google identity linked to the current user', async () => {
		await identitiesRepository.create({
			userId: userId,
			provider: IdentityProviders.google,
			providerSubject: 'fake-google-sub',
		});

		const result = await service.execute({ userId, idToken: 'valid-token' });

		expect(result.method).toBe(IdentityProviders.google);
		expect(result.authenticatedAt).toBeInstanceOf(Date);
	});

	it('rejects a valid Google identity linked to another user', async () => {
		await identitiesRepository.create({
			userId: '507f1f77bcf86cd799439012',
			provider: IdentityProviders.google,
			providerSubject: 'fake-google-sub',
		});

		await expect(service.execute({ userId, idToken: 'valid-token' })).rejects.toBeInstanceOf(UnauthorizedError);
	});

	it('rejects an unlinked Google identity', async () => {
		await expect(service.execute({ userId, idToken: 'valid-token' })).rejects.toBeInstanceOf(UnauthorizedError);
	});
});
