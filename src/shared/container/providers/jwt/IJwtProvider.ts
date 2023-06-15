import { ICreateRefreshToken, ICreateToken, IPayload, IVerifyRefreshToken } from '@modules/accounts/dtos/UsersTokens';

interface IJwtProvider {
	createToken(data: ICreateToken): string;
	createRefreshToken(data: ICreateRefreshToken): string;
	verifyRefreshToken(data: IVerifyRefreshToken): IPayload;
}

export { IJwtProvider };
