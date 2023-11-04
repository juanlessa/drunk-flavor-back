import auth from '@config/auth';
import { IRefreshUserToken, IRefreshTokenResponse } from '@modules/accounts/dtos/usersTokens.dtos';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
import { IDateProvider } from '@shared/container/providers/date/IDateProvider';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwt.provider';
import { UnauthorizedError } from '@shared/errors/error.lib';

class RefreshTokenService {
	constructor(
		private usersTokensRepository: IUsersTokensRepository,
		private dateProvider: IDateProvider,
		private jwtProvider: IJwtProvider
	) {}

	async execute({ token }: IRefreshUserToken): Promise<IRefreshTokenResponse> {
		const { sub: user_id } = this.jwtProvider.verifyRefreshToken({
			refresh_token: token,
			secret: auth.secret_refresh_token
		});

		const userToken = await this.usersTokensRepository.findByUserIdAndRefreshToken(user_id, token);

		if (!userToken) {
			throw new UnauthorizedError(AUTHENTICATION_ERRORS.not_exist_refresh_token, {
				path: 'RefreshToken.service',
				cause: 'User does not exists'
			});
		}

		const isExpiredDate = this.dateProvider.isExpiredDate(userToken.expires_date);
		if (isExpiredDate) {
			await this.usersTokensRepository.delete(userToken._id);
			throw new UnauthorizedError(AUTHENTICATION_ERRORS.invalid_token, {
				path: 'RefreshToken.service',
				cause: 'Expired token'
			});
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
