import {
	ICreateRefreshToken,
	ICreateToken,
	IPayload,
	IVerifyRefreshToken,
	IVerifyToken
} from '@modules/accounts/dtos/UsersTokens';

interface IJwtProvider {
	createToken(data: ICreateToken): string;
	createRefreshToken(data: ICreateRefreshToken): string;
	verifyRefreshToken(data: IVerifyRefreshToken): IPayload;
	verifyToken(data: IVerifyToken): IPayload;
}

export { IJwtProvider };
