import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { hasUsableSessionStatus } from '@/core/accounts/policies/SessionVersion.policy';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { PasswordReauthenticationResult, ReauthenticatePasswordCommand } from './reauthenticatePassword.dtos';

export class ReauthenticatePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private hashProvider: IHashProvider,
		private dateProvider: IDateProvider,
	) {}

	async execute({ userId, password }: ReauthenticatePasswordCommand): Promise<PasswordReauthenticationResult> {
		const user = await this.usersRepository.findById(userId);
		const credential = user ? await this.credentialsRepository.findByUserId(userId) : null;
		const passwordHash = credential?.passwordHash ?? (await this.hashProvider.getDummyHash());
		const passwordMatches = await this.hashProvider.compare(password, passwordHash);

		if (!user || !hasUsableSessionStatus(user.status) || !credential || !passwordMatches) {
			throw new UnauthorizedError('apiResponses.profile.invalidReauthentication', {
				path: 'ReauthenticatePassword.service',
				cause: !user ? 'User does not exist' : 'Password credential is missing or invalid',
			});
		}

		return { method: 'password', authenticatedAt: this.dateProvider.dateNow() };
	}
}
