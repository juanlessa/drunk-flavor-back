import { inject, injectable } from 'tsyringe';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import auth from '@config/auth';
import AppError from '@errors/AppError';
import { IDateProvider } from '@shared/container/providers/date/IDateProvider';
import { SafeParseError, z } from 'zod';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwtProvider';

const requestSchema = z.object({
	token: z.string({ required_error: 'Token is required.' }).min(1, { message: 'Invalid token!' })
});
type IRequest = z.infer<typeof requestSchema>;

interface IPayload {
	sub: string;
	email: string;
}

interface ITokenResponse {
	token: string;
	expires: Date;
}

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

	async execute(data: IRequest): Promise<ITokenResponse> {
		const result = requestSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IRequest>;
			throw new AppError(error.issues[0].message);
		}
		const { token } = result.data;

		const { email, sub: user_id } = this.jwtProvider.verifyRefreshToken({
			refresh_token: token,
			secret: auth.secret_refresh_token
		});

		const userToken = await this.usersTokensRepository.findByUserIdAndRefreshToken(user_id, token);

		if (!userToken) {
			throw new AppError('Refresh Token does not exists!');
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
