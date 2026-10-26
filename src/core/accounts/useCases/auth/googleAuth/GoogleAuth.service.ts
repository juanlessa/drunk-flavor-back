import { GoogleAuth } from './googleAuth.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { IGoogleTokenVerifier } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { User } from '@/core/accounts/entities/user.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { Roles } from '@/shared/accessControl/roles';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { IDENTITY_PROVIDER_SUB_UNIQUE_INDEX } from '@/core/accounts/infra/mongo/entities/identity.model';

type GoogleAuthResult = {
	user: {
		id: string;
		role: User['role'];
		status: User['status'];
	};
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
		const name = payload.given_name;
		const surname = payload.family_name;
		const picture = payload.picture;
		const now = new Date();

		// Branch (a): a known identity signs in.
		const identity = await this.identitiesRepository.findByProviderSub(IdentityProviders.google, sub);
		if (identity) {
			const user = await this.usersRepository.findById(identity.user_id);
			if (!user) {
				throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
					path: 'GoogleAuth.service.orphanIdentity',
					cause: 'identity references a missing user',
				});
			}

			await this.identitiesRepository.touchLastLogin(identity._id.toString(), now);

			return { user: { id: user._id.toString(), role: user.role, status: user.status } };
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

					let status = existingUser.status;
					if (existingUser.status !== UserStatuses.active || !existingUser.email_verified) {
						const updated = await this.usersRepository.update({
							id: existingUser._id.toString(),
							status: UserStatuses.active,
							email_verified: true,
						});
						status = updated.status;
					}

					return { user: { id: existingUser._id.toString(), role: existingUser.role, status } };
				});
			}

			// Branch (c): create a new verified user + identity. Google ID tokens may
			// omit `given_name`/`family_name`; rather than fabricating a name, create
			// the account as `incomplete_profile` and gate business routes until the
			// user completes it. When both parts are present, the account is active.
			const hasFullName = name !== undefined && surname !== undefined;
			return await this.transactionManager.withTransaction(async () => {
				const user = await this.usersRepository.create({
					...(name !== undefined ? { name } : {}),
					...(surname !== undefined ? { surname } : {}),
					email,
					email_verified: true,
					avatar_url: picture,
					role: Roles.member,
					status: hasFullName ? UserStatuses.active : UserStatuses.incomplete_profile,
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

				return { user: { id: user._id.toString(), role: user.role, status: user.status } };
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
						return { user: { id: user._id.toString(), role: user.role, status: user.status } };
					}
				}
			}
			throw error;
		}
	}
}
