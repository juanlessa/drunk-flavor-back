import { sign, verify } from 'jsonwebtoken';
import { IJwtProvider } from '../IJwt.provider';
import { ICreateToken, ICreateRefreshToken, IPayload, IVerifyRefreshToken, IVerifyToken } from '../jwt.dtos';
import { UnauthorizedError } from '@shared/errors/error.lib';

class JsonwebtokenProvider implements IJwtProvider {
	createToken({ subject, secret, expires_in }: ICreateToken): string {
		const token = sign({}, secret, {
			subject: subject,
			expiresIn: expires_in
		});
		return token;
	}

	createRefreshToken({ sign_property, subject, secret, expires_in }: ICreateRefreshToken): string {
		const refresh_token = sign({ sign_property }, secret, {
			subject: subject,
			expiresIn: expires_in
		});
		return refresh_token;
	}

	verifyRefreshToken({ refresh_token, secret }: IVerifyRefreshToken): IPayload {
		let decode: IPayload;
		try {
			decode = verify(refresh_token, secret) as IPayload;
		} catch {
			throw new UnauthorizedError('Invalid token', { path: 'Jsonwebtoken.provider' });
		}

		return decode;
	}

	verifyToken({ token, secret }: IVerifyToken): IPayload {
		let decode: IPayload;
		try {
			decode = verify(token, secret) as IPayload;
		} catch {
			throw new UnauthorizedError('Invalid token', { path: 'Jsonwebtoken.provider' });
		}

		return decode;
	}
}

export { JsonwebtokenProvider };
