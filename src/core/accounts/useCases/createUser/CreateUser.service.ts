import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { CreateUserDTO } from './createUser.dtos';
import { User, UserStatusEnum } from '../../entities/user.entity';
import { TokenTypeEnum } from '../../entities/userToken.entity';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IUserTokensRepository } from '../../repositories/IUserTokens.repository';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { FRONTEND_BASE_URL, FRONTEND_PAGE_PATHS } from '@/shared/constants/frontend.constants';
import { env } from '@/env';

export class CreateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private dateProvider: IDateProvider,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
		private mailerProvider: IMailerProvider,
		private templateProvider: ITemplateProvider,
	) {}

	async execute({ name, surname, email, password, role }: CreateUserDTO) {
		const existingUser = await this.usersRepository.findByEmail(email);
		if (existingUser) {
			await this.handleExistingUser(existingUser);
		}

		const newUser = await this.createUser({ name, surname, email, password, role });

		const token = await this.cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await this.sendVerificationEmail(newUser, token);

		await this.userTokensRepository.create({
			token,
			type: TokenTypeEnum['email-verification'],
			user_id: newUser._id.toString(),
		});
	}

	private isTokenExpired(createdAt: Date): boolean {
		const expirationDate = this.dateProvider.addSeconds(env.USER_TOKEN_EXPIRES_IN_SECONDS, createdAt);
		return this.dateProvider.isExpiredDate(expirationDate);
	}

	private async handleExistingUser(user: User) {
		if (user.status === UserStatusEnum['active']) {
			throw new BadRequestError('apiResponses.users.alreadyExist', {
				path: 'CreateUser.service.handleExistingUser.1',
			});
		}
		const userToken = await this.userTokensRepository.findByUserIdAndType({
			user_id: user._id.toString(),
			type: TokenTypeEnum['email-verification'],
		});

		if (!userToken || this.isTokenExpired(userToken.created_at)) {
			await this.usersRepository.delete(user._id.toString());
		} else {
			throw new BadRequestError('apiResponses.auth.emailVerificationPending', {
				path: 'CreateUser.service.handleExistingUser.2',
			});
		}
	}

	private async createUser({ name, surname, email, password, role }: CreateUserDTO) {
		const passwordHash = await this.hashProvider.hash(password);
		return await this.usersRepository.create({
			name,
			password: passwordHash,
			surname,
			email,
			role,
			status: UserStatusEnum['pending'],
		});
	}

	private async sendVerificationEmail(user: User, token: string) {
		const template = this.templateProvider.emailVerification({
			userName: user.name,
			verificationLink: `${FRONTEND_BASE_URL}${FRONTEND_PAGE_PATHS.verifyEmail}/${token}`,
		});

		await this.mailerProvider.send({
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'verify email',
			html: template,
		});
	}
}
