import { JwtPayload, TokenExpiredError, sign, verify } from 'jsonwebtoken';
import { IJwtProvider } from '../IJwt.provider';
import { ICreateToken, IPayload, IVerifyToken } from '../jwt.dtos';
import { ForbiddenError } from '@shared/errors/error.lib';

class JsonwebtokenProvider implements IJwtProvider {
	createToken({ subject, secret, expires_in }: ICreateToken): string {
		const token = sign({}, secret, {
			subject: subject,
			expiresIn: expires_in
		});
		return token;
	}

	verifyToken({ token, secret }: IVerifyToken): IPayload {
		try {
			const decoded = verify(token, secret) as JwtPayload;
			return { subject: decoded.sub || '', isExpired: false };
		} catch (err) {
			if (err instanceof TokenExpiredError) {
				return { subject: '', isExpired: true };
			}
			throw new ForbiddenError('invalid token', { cause: token, path: 'jwt.provider.verifyToken' });
		}
	}
}

export { JsonwebtokenProvider };
