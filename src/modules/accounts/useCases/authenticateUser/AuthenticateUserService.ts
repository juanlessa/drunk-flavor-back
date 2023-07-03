import auth from '@config/auth';
import AppError from '@errors/AppError';
import { IAuthenticateUser, IAuthenticateUserResponse } from '@modules/accounts/dtos/Users';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authenticationErrors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { authenticateUserSchema } from '@modules/accounts/validations/users';
import { IDateProvider } from '@shared/container/providers/date/IDateProvider';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryptionProvider';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwtProvider';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class AuthenticateUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository,
		@inject('UsersTokensRepository')
		private usersTokensRepository: IUsersTokensRepository,
		@inject('DayjsDateProvider')
		private dateProvider: IDateProvider,
		@inject('JsonwebtokenProvider')
		private jwtProvider: IJwtProvider,
		@inject('BcryptProvider')
		private bcryptProvider: IEncryptionProvider
	) {}
	async execute(data: IAuthenticateUser): Promise<IAuthenticateUserResponse> {
		const result = authenticateUserSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IAuthenticateUser>;
			throw new AppError(error.issues[0].message);
		}
		const { email, password } = result.data;

		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new AppError(AUTHENTICATION_ERRORS.invalid_credentials);
		}

		const passwordMatch = await this.bcryptProvider.compare(password, user.password);
		if (!passwordMatch) {
			throw new AppError(AUTHENTICATION_ERRORS.invalid_credentials);
		}

		// create token
		const token = this.jwtProvider.createToken({
			userId: user.id,
			secret: auth.secret_token,
			expiresIn: auth.expires_in_token
		});
		const token_expires_date = this.dateProvider.addHours(auth.expires_token_hours);

		// create refresh token
		const refresh_token = this.jwtProvider.createRefreshToken({
			userEmail: email,
			userId: user.id,
			secret: auth.secret_refresh_token,
			expiresIn: auth.expires_in_refresh_token
		});
		const refresh_token_expires_date = this.dateProvider.addDays(auth.expires_refresh_token_days);

		await this.usersTokensRepository.create({
			expires_date: refresh_token_expires_date,
			refresh_token: refresh_token,
			user_id: user.id
		});

		return {
			user: {
				name: user.name,
				email: user.email
			},
			token: {
				token: token,
				expires: token_expires_date
			},
			refresh_token: {
				token: refresh_token,
				expires: refresh_token_expires_date
			}
		};
	}
}

export { AuthenticateUserService };
