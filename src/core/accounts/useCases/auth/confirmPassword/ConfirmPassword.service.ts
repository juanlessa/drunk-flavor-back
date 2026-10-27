import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ConfirmPassword } from './confirmPassword.dtos';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';

export class ConfirmPasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private dateProvider: IDateProvider,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute({ token, password }: ConfirmPassword) {
		const tokenHash = this.cryptoProvider.hashToken(token);
		const tokenRecord = await this.tokensRepository.findByTokenHash(tokenHash);
		if (!tokenRecord) {
			throw new BadRequestError('apiResponses.auth.tokenNotFound', { path: 'ConfirmPassword.service.1' });
		}
		const isTokenExpired = this.dateProvider.isExpiredDate(tokenRecord.expiresAt);
		if (tokenRecord && isTokenExpired) {
			await this.tokensRepository.delete(tokenRecord.id);
			throw new BadRequestError('apiResponses.auth.expiredToken', { path: 'ConfirmPassword.service.2' });
		}

		const user = await this.usersRepository.findById(tokenRecord.userId);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'ConfirmPassword.service.3' });
		}

		const hashedPassword = await this.hashProvider.hash(password);

		const existingCredential = await this.credentialsRepository.findByUserId(user.id);
		if (existingCredential) {
			await this.credentialsRepository.update({ userId: user.id, passwordHash: hashedPassword });
		} else {
			await this.credentialsRepository.create({ userId: user.id, passwordHash: hashedPassword });
		}
		await this.tokensRepository.delete(tokenRecord.id);
	}
}
