import { ICreateToken, IPayload, IVerifyToken } from './jwt.dtos';

interface IJwtProvider {
	createToken(data: ICreateToken): string;
	verifyToken(data: IVerifyToken): IPayload;
}

export { IJwtProvider };
