import auth from '@config/auth';
import AppError from '@errors/AppError';
import { IRefreshToken, IRefreshTokenResponse } from '@modules/accounts/dtos/UsersTokens';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authenticationErrors';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { refreshTokenSchema } from '@modules/accounts/validations/usersTokens';
import { IDateProvider } from '@shared/container/providers/date/IDateProvider';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwtProvider';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class RefreshTokenService {
	constructor(
		@inject('UsersTokensRepository')
		private usersTokensRepository: IUsersTokensRepository,
		@inject('DayjsDateProvider')
		private dateProvider: IDateProvider,
		@inject('JsonwebtokenProvider')
		private jwtProvider: IJwtProvider
	) {}

	async execute(data: IRefreshToken): Promise<IRefreshTokenResponse> {
		const result = refreshTokenSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IRefreshToken>;
			throw new AppError(error.issues[0].message);
		}
		const { token } = result.data;

		const { sub: user_id } = this.jwtProvider.verifyRefreshToken({
			refresh_token: token,
			secret: auth.secret_refresh_token
		});

		const userToken = await this.usersTokensRepository.findByUserIdAndRefreshToken(user_id, token);

		if (!userToken) {
			throw new AppError(AUTHENTICATION_ERRORS.not_exist_refresh_token);
		}

		// create token
		const newToken = this.jwtProvider.createToken({
			userId: user_id,
			secret: auth.secret_token,
			expiresIn: auth.expires_in_token
		});
		const new_token_expires_date = this.dateProvider.addHours(auth.expires_token_hours);

		return {
			token: newToken,
			expires: new_token_expires_date
		};
	}
}

export { RefreshTokenService };
