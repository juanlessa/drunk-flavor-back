import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ConfirmEmail } from './confirmEmail.dtos';
import { UserStatuses } from '@/core/accounts/entities/user.entity';

export class ConfirmEmailService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private dateProvider: IDateProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute({ token }: ConfirmEmail) {
		const tokenRecord = await this.tokensRepository.findByToken(this.cryptoProvider.hashToken(token));

		if (!tokenRecord) {
			throw new BadRequestError('apiResponses.auth.tokenNotFound', { path: 'ConfirmEmail.service.1' });
		}

		if (tokenRecord && this.dateProvider.isExpiredDate(tokenRecord.expires_at)) {
			await this.tokensRepository.delete(tokenRecord._id.toString());
			throw new BadRequestError('apiResponses.auth.expiredToken', { path: 'ConfirmEmail.service.2' });
		}

		const user = await this.usersRepository.findById(tokenRecord.user_id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'ConfirmEmail.service.3' });
		}

		await this.usersRepository.update({ id: user._id.toString(), status: UserStatuses['active'] });
		await this.tokensRepository.delete(tokenRecord._id.toString());
	}
}
