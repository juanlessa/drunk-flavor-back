import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ConfirmEmail } from './confirmEmail.dtos';
import { UserStatusEnum } from '@/core/accounts/entities/user.entity';

export class ConfirmEmailService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private dateProvider: IDateProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute({ token }: ConfirmEmail) {
		const userToken = await this.userTokensRepository.findByToken(this.cryptoProvider.hashToken(token));

		if (!userToken) {
			throw new BadRequestError('apiResponses.auth.tokenNotFound', { path: 'ConfirmEmail.service.1' });
		}

		if (userToken && this.dateProvider.isExpiredDate(userToken.expires_at)) {
			await this.userTokensRepository.delete(userToken._id.toString());
			throw new BadRequestError('apiResponses.auth.expiredToken', { path: 'ConfirmEmail.service.2' });
		}

		const user = await this.usersRepository.findById(userToken.user_id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'ConfirmEmail.service.3' });
		}

		await this.usersRepository.update({ id: user._id.toString(), status: UserStatusEnum['active'] });
		await this.userTokensRepository.delete(userToken._id.toString());
	}
}
