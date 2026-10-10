import { UserStatusEnum } from '@/core/accounts/entities/user.entity';
import { TokenTypeEnum } from '@/core/accounts/entities/userToken.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { env } from '@/env';
import { ResendEmailVerification } from './resendEmailVerification.dtos';

export class ResendEmailVerificationService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private dateProvider: IDateProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute({ email }: ResendEmailVerification): Promise<void> {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', {
				path: 'ResendEmailVerification.service.userNotFound',
			});
		}

		if (user.status === UserStatusEnum['active']) {
			throw new BadRequestError('apiResponses.auth.emailAlreadyVerified', {
				path: 'ResendEmailVerification.service.alreadyVerified',
			});
		}

		const existingToken = await this.userTokensRepository.findByUserIdAndType({
			user_id: user._id.toString(),
			type: TokenTypeEnum['email-verification'],
		});

		if (
			existingToken &&
			!this.dateProvider.isExpiredDate(
				this.dateProvider.addSeconds(env.USER_TOKEN_EXPIRES_IN_SECONDS, existingToken.created_at),
			)
		) {
			throw new BadRequestError('apiResponses.auth.actionAlreadyRequested', {
				path: 'ResendEmailVerification.service.resendNotAllowed',
			});
		}

		if (existingToken) {
			await this.userTokensRepository.delete(existingToken._id.toString());
		}

		const token = await this.cryptoProvider.generateToken(env.USER_TOKEN_SIZE);

		await this.userTokensRepository.create({
			token: this.cryptoProvider.hashToken(token),
			type: TokenTypeEnum['email-verification'],
			user_id: user._id.toString(),
		});

		// The verification email will be queued through BullMQ.
	}
}
