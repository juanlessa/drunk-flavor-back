import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { PasswordReauthenticationResult, ReauthenticatePassword } from './reauthenticatePassword.dtos';

export class ReauthenticatePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private hashProvider: IHashProvider,
		private dateProvider: IDateProvider,
	) {}

	async execute({ userId, password }: ReauthenticatePassword): Promise<PasswordReauthenticationResult> {
		const user = await this.usersRepository.findById(userId);
		const credential = user ? await this.credentialsRepository.findByUserId(userId) : null;
		const passwordHash = credential?.passwordHash ?? (await this.hashProvider.getDummyHash());
		const passwordMatches = await this.hashProvider.compare(password, passwordHash);

		if (
			!user ||
			(user.status !== UserStatuses.active && user.status !== UserStatuses.incomplete_profile) ||
			!credential ||
			!passwordMatches
		) {
			throw new UnauthorizedError('apiResponses.profile.invalidReauthentication', {
				path: 'ReauthenticatePassword.service',
				cause: !user ? 'User does not exist' : 'Password credential is missing or invalid',
			});
		}

		return { method: 'password', authenticatedAt: this.dateProvider.dateNow() };
	}
}
