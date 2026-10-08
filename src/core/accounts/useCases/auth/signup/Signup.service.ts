import { UserStatusEnum } from '@/core/accounts/entities/user.entity';
import { TokenTypeEnum } from '@/core/accounts/entities/userToken.entity';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { Signup } from './signup.dtos';
import { env } from '@/env';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { RolesEnum } from '@/shared/accessControl/roles';

export class SignupService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private transactionManager: ITransactionManager,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
	) {}

	async execute({ name, surname, email, password }: Signup): Promise<void> {
		const existingUser = await this.usersRepository.findByEmail(email);

		if (existingUser && existingUser.status === UserStatusEnum['active']) {
			throw new BadRequestError('apiResponses.users.alreadyExist', {
				path: 'Signup.service.ensureEmailIsAvailable.active',
			});
		}
		if (existingUser && existingUser.status === UserStatusEnum['pending']) {
			throw new BadRequestError('apiResponses.auth.emailVerificationPending', {
				path: 'Signup.service.ensureEmailIsAvailable.pending',
			});
		}

		const passwordHash = await this.hashProvider.hash(password);
		const token = await this.cryptoProvider.generateToken(env.USER_TOKEN_SIZE);

		await this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.create({
				name: name,
				surname: surname,
				email: email,
				password: passwordHash,
				role: RolesEnum['member'],
				status: UserStatusEnum['pending'],
			});

			await this.userTokensRepository.create({
				token,
				type: TokenTypeEnum['email-verification'],
				user_id: user._id.toString(),
			});
		});

		// The verification email will be queued through BullMQ after the transaction commits.
	}
}
