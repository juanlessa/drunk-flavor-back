import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ConfirmEmail } from './confirmEmail.dtos';
import { UserStatuses } from '@/core/accounts/constants/user.constants';

export class ConfirmEmailService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private dateProvider: IDateProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute({ token }: ConfirmEmail) {
		const tokenHash = this.cryptoProvider.hashToken(token);
		const tokenRecord = await this.tokensRepository.findByTokenHash(tokenHash);

		if (!tokenRecord) {
			throw new BadRequestError('apiResponses.auth.tokenNotFound', { path: 'ConfirmEmail.service.1' });
		}

		const isTokenExpired = this.dateProvider.isExpiredDate(tokenRecord.expiresAt);
		if (tokenRecord && isTokenExpired) {
			await this.tokensRepository.delete(tokenRecord.id);
			throw new BadRequestError('apiResponses.auth.expiredToken', { path: 'ConfirmEmail.service.2' });
		}

		const user = await this.usersRepository.findById(tokenRecord.userId);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'ConfirmEmail.service.3' });
		}

		await this.usersRepository.update({
			id: user.id,
			status: UserStatuses.active,
			sessionVersion: user.sessionVersion + 1,
		});
		await this.tokensRepository.delete(tokenRecord.id);
	}
}
