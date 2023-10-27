import auth from '@config/auth';
import AppError from '@shared/errors/AppError';
import { IAuthenticateUser, IAuthenticateUserResponse } from '@modules/accounts/dtos/authentication.dtos';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
import { IDateProvider } from '@shared/container/providers/date/IDateProvider';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryption.provider';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwt.provider';

class AuthenticateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private usersTokensRepository: IUsersTokensRepository,
		private dateProvider: IDateProvider,
		private jwtProvider: IJwtProvider,
		private encryptionProvider: IEncryptionProvider
	) {}

	async execute({ email, password }: IAuthenticateUser): Promise<IAuthenticateUserResponse> {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new AppError(AUTHENTICATION_ERRORS.invalid_credentials);
		}

		const passwordMatch = await this.encryptionProvider.compare(password, user.password);
		if (!passwordMatch) {
			throw new AppError(AUTHENTICATION_ERRORS.invalid_credentials);
		}

		// create token
		const token = this.jwtProvider.createToken({
			subject: user._id.toString(),
			secret: auth.secret_token,
			expires_in: auth.expires_in_token
		});
		const token_expires_date = this.dateProvider.addHours(auth.expires_token_hours);

		// create refresh token
		const refresh_token = this.jwtProvider.createRefreshToken({
			sign_property: email,
			subject: user._id.toString(),
			secret: auth.secret_refresh_token,
			expires_in: auth.expires_in_refresh_token
		});
		const refresh_token_expires_date = this.dateProvider.addDays(auth.expires_refresh_token_days);

		await this.usersTokensRepository.create({
			expires_date: refresh_token_expires_date,
			refresh_token: refresh_token,
			user_id: user._id
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
