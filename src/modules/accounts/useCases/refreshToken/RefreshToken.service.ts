import auth from '@config/auth';
import AppError from '@errors/AppError';
import { IRefreshUserToken, IRefreshTokenResponse } from '@modules/accounts/dtos/usersTokens.dtos';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
import { IDateProvider } from '@shared/container/providers/date/IDateProvider';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwt.provider';
import { inject, injectable } from 'tsyringe';

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

	async execute({ token }: IRefreshUserToken): Promise<IRefreshTokenResponse> {
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
			subject: user_id,
			secret: auth.secret_token,
			expires_in: auth.expires_in_token
		});
		const new_token_expires_date = this.dateProvider.addHours(auth.expires_token_hours);

		return {
			token: newToken,
			expires: new_token_expires_date
		};
	}
}

export { RefreshTokenService };
