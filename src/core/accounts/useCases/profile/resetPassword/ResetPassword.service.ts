import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ResetPassword } from './resetPassword.dtos';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';

export class ResetPasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private dateProvider: IDateProvider,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute({ token, password }: ResetPassword) {
		const userToken = await this.userTokensRepository.findByToken(this.cryptoProvider.hashToken(token));

		if (!userToken) {
			throw new BadRequestError('apiResponses.auth.tokenNotFound', { path: 'ResetPassword.service.1' });
		}

		if (userToken && this.dateProvider.isExpiredDate(userToken.expires_at)) {
			await this.userTokensRepository.delete(userToken._id.toString());
			throw new BadRequestError('apiResponses.auth.expiredToken', { path: 'ResetPassword.service.2' });
		}

		const user = await this.usersRepository.findById(userToken.user_id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'ResetPassword.service.3' });
		}

		const hashedPassword = await this.hashProvider.hash(password);

		await this.usersRepository.update({ id: user._id.toString(), password: hashedPassword });
		await this.userTokensRepository.delete(userToken._id.toString());
	}
}
