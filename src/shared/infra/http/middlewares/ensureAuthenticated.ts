import { authConfig } from '@config/auth';
import { AppNextFunction, AppRequest, AppResponse } from '../types';
import { ForbiddenError, NotFoundError } from '@shared/errors/error.lib';
import { resolveJwtProvider } from '@shared/container/providers/jwt';
import { cookiesConfig } from '@config/cookies';

export const signOut = async (request: AppRequest, response: AppResponse) => {
	void response.clearCookie('authorization');
	return { ok: true };
};

export async function ensureAuthenticated(request: AppRequest, response: AppResponse, next: AppNextFunction) {
	const signedToken = request.cookies.authorization as string | undefined;
	const accessToken = (request.headers.authorization || signedToken || '').replace('Bearer ', '');

	if (!accessToken) {
		void signOut(request, response);
		throw new NotFoundError('invalid resource', { cause: accessToken, path: 'auth.fastify.verifyAndRenewToken.1' });
	}

	const jwtProvider = resolveJwtProvider();

	const data = jwtProvider.verifyToken({ token: accessToken, secret: authConfig.ACCESS_TOKEN_SECRET });
	const isExpired = data.isExpired;
	let userId = data.subject;

	if (!isExpired && !userId) {
		void signOut(request, response);
		throw new NotFoundError('invalid resource', { cause: accessToken, path: 'auth.fastify.verifyAndRenewToken.2' });
	}

	if (!isExpired) {
		response.cookie('authorization', accessToken, cookiesConfig);
		request.user = { id: userId };
		return next();
	}

	const session = request.session?.refreshToken;

	if (!session) {
		throw new NotFoundError('invalid resource', {
			cause: 'no session found',
			path: 'auth.fastify.verifyAndRenewToken.3'
		});
	}

	const refreshToken = session.refreshToken;
	userId = session.userId;

	const refreshTokenData = jwtProvider.verifyToken({ token: refreshToken, secret: authConfig.REFRESH_TOKEN_SECRET });
	const isRefreshTokenExpired = refreshTokenData.isExpired;

	if (isRefreshTokenExpired) {
		void signOut(request, response);
		throw new ForbiddenError('invalid token', { cause: refreshToken, path: 'auth.fastify.verifyAndRenewToken.2' });
	}

	const newAccessToken = jwtProvider.createToken({
		subject: userId,
		secret: authConfig.ACCESS_TOKEN_SECRET,
		expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
	});

	request.user = { id: userId };
	request.session.refreshToken = { refreshToken, userId: userId };
	response.cookie('authorization', newAccessToken, cookiesConfig);

	return next();
}
