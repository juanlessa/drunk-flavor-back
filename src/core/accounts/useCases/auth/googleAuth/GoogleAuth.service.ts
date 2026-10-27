import { GoogleAuth } from './googleAuth.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { IGoogleTokenVerifier } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { VerifiedGoogleIdentity } from '@/shared/providers/googleAuth/googleAuth.dtos';
import { ConflictError, UnauthorizedError } from '@/shared/error/error.lib';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { User } from '@/core/accounts/entities/user.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { Roles } from '@/shared/accessControl/roles';
import { IdentityProviderSubjectAlreadyExistsError } from '@/core/accounts/errors/identity.errors';

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
		const googleProfile = await this.googleTokenVerifier.verify(idToken);
		const authenticatedAt = new Date();

		const linkedGoogleSignIn = await this.signInWithLinkedGoogleIdentity(googleProfile.subject, authenticatedAt);
		if (linkedGoogleSignIn) {
			return linkedGoogleSignIn;
		}

		const verifiedEmail = this.requireVerifiedEmailForGoogleSignup(googleProfile);
		await this.ensureEmailIsAvailableForGoogleSignup(verifiedEmail);

		try {
			return await this.createAccountWithGoogleIdentity(googleProfile, verifiedEmail, authenticatedAt);
		} catch (error) {
			return this.resolveConcurrentGoogleIdentityCreation(error, googleProfile.subject);
		}
	}

	private async signInWithLinkedGoogleIdentity(
		googleSubject: string,
		authenticatedAt: Date,
	): Promise<GoogleAuthResult | null> {
		const identity = await this.identitiesRepository.findByProviderSub(IdentityProviders.google, googleSubject);
		if (!identity) {
			return null;
		}

		const user = await this.usersRepository.findById(identity.user_id);
		if (!user) {
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'GoogleAuth.service.orphanIdentity',
				cause: 'identity references a missing user',
			});
		}

		await this.identitiesRepository.touchLastLogin(identity._id.toString(), authenticatedAt);

		return { user: { id: user._id.toString(), role: user.role, status: user.status } };
	}

	private requireVerifiedEmailForGoogleSignup(googleProfile: VerifiedGoogleIdentity): string {
		if (googleProfile.isEmailVerified !== true) {
			throw new UnauthorizedError('apiResponses.auth.googleEmailNotVerified', {
				path: 'GoogleAuth.service.emailNotVerified',
				cause: 'verified Google identity does not contain a verified email',
			});
		}

		if (!googleProfile.email) {
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'GoogleAuth.service.missingEmail',
				cause: 'verified google token without an email',
			});
		}

		return googleProfile.email.toLowerCase();
	}

	private async ensureEmailIsAvailableForGoogleSignup(verifiedEmail: string): Promise<void> {
		const existingUser = await this.usersRepository.findByEmail(verifiedEmail);
		if (existingUser) {
			throw new ConflictError('apiResponses.auth.accountLinkRequired', {
				path: 'GoogleAuth.service.accountLinkRequired',
				cause: 'An account with this verified email already exists without this Google identity',
			});
		}
	}

	private async createAccountWithGoogleIdentity(
		googleProfile: VerifiedGoogleIdentity,
		verifiedEmail: string,
		authenticatedAt: Date,
	): Promise<GoogleAuthResult> {
		const name = googleProfile.givenName;
		const surname = googleProfile.familyName;
		const hasFullName = name !== undefined && surname !== undefined;

		return this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.create({
				...(name !== undefined ? { name } : {}),
				...(surname !== undefined ? { surname } : {}),
				email: verifiedEmail,
				email_verified: true,
				avatar_url: googleProfile.pictureUrl,
				role: Roles.member,
				status: hasFullName ? UserStatuses.active : UserStatuses.incomplete_profile,
			});

			await this.identitiesRepository.create({
				user_id: user._id.toString(),
				provider: IdentityProviders.google,
				provider_sub: googleProfile.subject,
				email: verifiedEmail,
				email_verified: true,
				picture: googleProfile.pictureUrl,
				last_login_at: authenticatedAt,
			});

			return { user: { id: user._id.toString(), role: user.role, status: user.status } };
		});
	}

	private async resolveConcurrentGoogleIdentityCreation(
		error: unknown,
		googleSubject: string,
	): Promise<GoogleAuthResult> {
		if (!(error instanceof IdentityProviderSubjectAlreadyExistsError)) {
			throw error;
		}

		const identity = await this.identitiesRepository.findByProviderSub(IdentityProviders.google, googleSubject);
		if (!identity) {
			throw error;
		}

		const user = await this.usersRepository.findById(identity.user_id);
		if (!user) {
			throw error;
		}

		return { user: { id: user._id.toString(), role: user.role, status: user.status } };
	}
}
