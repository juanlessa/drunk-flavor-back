import { ICreateToken, ICreateRefreshToken, IPayload, IVerifyRefreshToken, IVerifyToken } from './jwt.dtos';

interface IJwtProvider {
	createToken(data: ICreateToken): string;
	createRefreshToken(data: ICreateRefreshToken): string;
	verifyRefreshToken(data: IVerifyRefreshToken): IPayload;
	verifyToken(data: IVerifyToken): IPayload;
}

export { IJwtProvider };
