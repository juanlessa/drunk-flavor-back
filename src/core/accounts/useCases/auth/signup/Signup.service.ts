import { User, UserStatusEnum } from '@/core/accounts/entities/user.entity';
import { TokenTypeEnum, UserToken } from '@/core/accounts/entities/userToken.entity';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { Signup } from './signup.dtos';
import { env } from '@/env';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { RolesEnum } from '@/shared/accessControl/roles';

export class SignupService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private transactionManager: ITransactionManager,
		private dateProvider: IDateProvider,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute(signup: Signup): Promise<void> {
		const passwordHash = await this.hashProvider.hash(signup.password);
		const token = await this.cryptoProvider.generateToken(env.USER_TOKEN_SIZE);

		await this.transactionManager.withTransaction(async () => {
			const user = await this.resolveUser(signup, passwordHash);

			await this.userTokensRepository.create({
				token,
				type: TokenTypeEnum['email-verification'],
				user_id: user._id.toString(),
			});
		});

		// The verification email will be queued through BullMQ after the transaction commits.
	}

	private isTokenExpired(createdAt: Date): boolean {
		const expirationDate = this.dateProvider.addSeconds(env.USER_TOKEN_EXPIRES_IN_SECONDS, createdAt);
		return this.dateProvider.isExpiredDate(expirationDate);
	}

	private async resolveUser(signup: Signup, passwordHash: string): Promise<User> {
		const existingUser = await this.usersRepository.findByEmail(signup.email);
		if (!existingUser) {
			return this.usersRepository.create({
				name: signup.name,
				surname: signup.surname,
				email: signup.email,
				password: passwordHash,
				role: RolesEnum['member'],
				status: UserStatusEnum['pending'],
			});
		}

		const existingToken = await this.validateExistingUser(existingUser);
		if (existingToken) {
			await this.userTokensRepository.delete(existingToken._id.toString());
		}

		return this.usersRepository.update({
			id: existingUser._id.toString(),
			name: signup.name,
			surname: signup.surname,
			password: passwordHash,
			status: UserStatusEnum['pending'],
		});
	}

	private async validateExistingUser(user: User): Promise<UserToken | null> {
		if (user.status === UserStatusEnum['active']) {
			throw new BadRequestError('apiResponses.users.alreadyExist', {
				path: 'Signup.service.validateExistingUser.1',
			});
		}

		const userToken = await this.userTokensRepository.findByUserIdAndType({
			user_id: user._id.toString(),
			type: TokenTypeEnum['email-verification'],
		});

		if (userToken && !this.isTokenExpired(userToken.created_at)) {
			throw new BadRequestError('apiResponses.auth.emailVerificationPending', {
				path: 'Signup.service.validateExistingUser.2',
			});
		}

		return userToken;
	}
}
