import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { ConfirmPassword } from './confirmPassword.dtos';

export class ConfirmPasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private dateProvider: IDateProvider,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ token, password }: ConfirmPassword): Promise<void> {
		const tokenHash = this.cryptoProvider.hashToken(token);
		const initialTokenRecord = await this.tokensRepository.findByTokenHash(tokenHash);
		if (!initialTokenRecord) {
			throw new BadRequestError('apiResponses.auth.tokenNotFound', { path: 'ConfirmPassword.service.1' });
		}
		if (this.dateProvider.isExpiredDate(initialTokenRecord.expiresAt)) {
			await this.tokensRepository.delete(initialTokenRecord.id);
			throw new BadRequestError('apiResponses.auth.expiredToken', { path: 'ConfirmPassword.service.2' });
		}

		const hashedPassword = await this.hashProvider.hash(password);
		await this.transactionManager.withTransaction(async () => {
			const tokenRecord = await this.tokensRepository.findByTokenHash(tokenHash);
			if (!tokenRecord || this.dateProvider.isExpiredDate(tokenRecord.expiresAt)) {
				throw new BadRequestError('apiResponses.auth.invalidTokenFormat', {
					path: 'ConfirmPassword.service.concurrentTokenValidation',
				});
			}

			const user = await this.usersRepository.findById(tokenRecord.userId);
			if (!user) {
				throw new BadRequestError('apiResponses.users.notExist', { path: 'ConfirmPassword.service.3' });
			}

			const existingCredential = await this.credentialsRepository.findByUserId(user.id);
			if (existingCredential) {
				await this.credentialsRepository.update({ userId: user.id, passwordHash: hashedPassword });
			} else {
				await this.credentialsRepository.create({ userId: user.id, passwordHash: hashedPassword });
			}
			await this.usersRepository.update({
				id: user.id,
				sessionVersion: user.sessionVersion + 1,
			});
			await this.tokensRepository.delete(tokenRecord.id);
		});
	}
}
