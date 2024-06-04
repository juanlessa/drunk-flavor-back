import { authConfig } from '@config/auth';
import { IAuthenticateUser, IAuthenticateUserResponse } from '@modules/accounts/dtos/authentication.dtos';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { IDateProvider } from '@shared/container/providers/date/IDateProvider';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryption.provider';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwt.provider';
import { BadRequestError } from '@shared/errors/error.lib';

class AuthenticateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private dateProvider: IDateProvider,
		private jwtProvider: IJwtProvider,
		private encryptionProvider: IEncryptionProvider
	) {}

	async execute({ email, password }: IAuthenticateUser): Promise<IAuthenticateUserResponse> {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError(AUTHENTICATION_ERRORS.invalid_credentials, {
				path: 'AuthenticateUser.service',
				cause: 'invalid email'
			});
		}

		const passwordMatch = await this.encryptionProvider.compare(password, user.password);
		if (!passwordMatch) {
			throw new BadRequestError(AUTHENTICATION_ERRORS.invalid_credentials, {
				path: 'AuthenticateUser.service',
				cause: 'invalid password'
			});
		}

		// create access token
		const accessToken = this.jwtProvider.createToken({
			subject: user._id.toString(),
			secret: authConfig.ACCESS_TOKEN_SECRET,
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});

		// create refresh token
		const refreshToken = this.jwtProvider.createToken({
			subject: '',
			secret: authConfig.REFRESH_TOKEN_SECRET,
			expires_in: authConfig.REFRESH_TOKEN_EXPIRES_IN
		});

		return {
			user: {
				name: user.name,
				surname: user.surname,
				email: user.email
			},
			accessToken: accessToken,
			refreshToken: refreshToken
		};
	}
}

export { AuthenticateUserService };
