import { GoogleAuth } from './googleAuth.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { IGoogleTokenVerifier } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IdentityProviders } from '@/core/accounts/entities/identity.entity';
import { UserStatuses, User } from '@/core/accounts/entities/user.entity';
import { Roles } from '@/shared/accessControl/roles';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { IDENTITY_PROVIDER_SUB_UNIQUE_INDEX } from '@/core/accounts/infra/mongo/entities/identity.model';

type GoogleAuthResult = {
	user: {
		id: string;
		role: User['role'];
	};
};

// Derives a non-empty display name from the email local part when Google omits
// `given_name`. `name` is required and must be non-empty for display.
const deriveNameFromEmail = (email?: string): string => {
	const localPart = email?.split('@')[0];
	return localPart && localPart.length > 0 ? localPart : 'user';
};

export class GoogleAuthService {
	constructor(
		private googleTokenVerifier: IGoogleTokenVerifier,
		private usersRepository: IUsersRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ idToken }: GoogleAuth): Promise<GoogleAuthResult> {
		const payload = await this.googleTokenVerifier.verify(idToken);

		const sub = payload.sub;
		const email = payload.email?.toLowerCase();
		const name = payload.given_name ?? deriveNameFromEmail(email);
		const surname = payload.family_name ?? '';
		const picture = payload.picture;
		const now = new Date();

		// Branch (a): a known identity signs in.
		const identity = await this.identitiesRepository.findByProviderSub(IdentityProviders.google, sub);
		if (identity) {
			const user = await this.usersRepository.findById(identity.user_id);
			// Defensive: an identity whose user row is gone is a data-integrity
			// orphan. Fail with the same opaque 401 used everywhere here.
			if (!user) {
				throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
					path: 'GoogleAuth.service.orphanIdentity',
					cause: 'identity references a missing user',
				});
			}

			await this.identitiesRepository.touchLastLogin(identity._id.toString(), now);

			return { user: { id: user._id.toString(), role: user.role } };
		}

		// Branches (b) and (c) require a verified email.
		if (payload.email_verified !== true) {
			throw new UnauthorizedError('apiResponses.auth.googleEmailNotVerified', {
				path: 'GoogleAuth.service.emailNotVerified',
				cause: 'google token email_verified is not true',
			});
		}

		if (!email) {
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'GoogleAuth.service.missingEmail',
				cause: 'verified google token without an email',
			});
		}

		const existingUser = await this.usersRepository.findByEmail(email);

		try {
			if (existingUser) {
				// Branch (b): link a new Google identity to the existing local account.
				return await this.transactionManager.withTransaction(async () => {
					await this.identitiesRepository.create({
						user_id: existingUser._id.toString(),
						provider: IdentityProviders.google,
						provider_sub: sub,
						email,
						email_verified: true,
						picture,
						last_login_at: now,
					});

					if (existingUser.status !== UserStatuses.active || !existingUser.email_verified) {
						await this.usersRepository.update({
							id: existingUser._id.toString(),
							status: UserStatuses.active,
							email_verified: true,
						});
					}

					return { user: { id: existingUser._id.toString(), role: existingUser.role } };
				});
			}

			// Branch (c): create a new active, verified user + identity.
			return await this.transactionManager.withTransaction(async () => {
				const user = await this.usersRepository.create({
					name,
					surname,
					email,
					email_verified: true,
					avatar_url: picture,
					role: Roles.member,
					status: UserStatuses.active,
				});

				await this.identitiesRepository.create({
					user_id: user._id.toString(),
					provider: IdentityProviders.google,
					provider_sub: sub,
					email,
					email_verified: true,
					picture,
					last_login_at: now,
				});

				return { user: { id: user._id.toString(), role: user.role } };
			});
		} catch (error) {
			// A concurrent request won the race to insert the same (provider,
			// provider_sub). This is a recoverable concurrency outcome, not a client
			// error: re-read the now-existing identity and continue as branch (a).
			if (isDuplicateKeyError(error, [IDENTITY_PROVIDER_SUB_UNIQUE_INDEX])) {
				const racedIdentity = await this.identitiesRepository.findByProviderSub(IdentityProviders.google, sub);
				if (racedIdentity) {
					const user = await this.usersRepository.findById(racedIdentity.user_id);
					if (user) {
						return { user: { id: user._id.toString(), role: user.role } };
					}
				}
			}
			throw error;
		}
	}
}
