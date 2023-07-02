import { sign, verify } from 'jsonwebtoken';
import auth from '@config/auth';
import { IJwtProvider } from '../IJwtProvider';
import {
	ICreateRefreshToken,
	ICreateToken,
	IPayload,
	IVerifyRefreshToken,
	IVerifyToken
} from '@modules/accounts/dtos/UsersTokens';
import AppError from '@shared/errors/AppError';

class JsonwebtokenProvider implements IJwtProvider {
	createToken({ userId, secret, expiresIn }: ICreateToken): string {
		const token = sign({}, secret, {
			subject: userId,
			expiresIn: expiresIn
		});
		return token;
	}

	createRefreshToken({ userEmail, userId, secret, expiresIn }: ICreateRefreshToken): string {
		const refresh_token = sign({ userEmail }, secret, {
			subject: userId,
			expiresIn: expiresIn
		});
		return refresh_token;
	}

	verifyRefreshToken({ refresh_token, secret }: IVerifyRefreshToken): IPayload {
		let decode: IPayload;
		try {
			decode = verify(refresh_token, secret) as IPayload;
		} catch {
			throw new AppError('Invalid token', 401);
		}

		return decode;
	}

	verifyToken({ token, secret }: IVerifyToken): IPayload {
		let decode: IPayload;
		try {
			decode = verify(token, secret) as IPayload;
		} catch {
			throw new AppError('Invalid token', 401);
		}

		return decode;
	}
}

export { JsonwebtokenProvider };
