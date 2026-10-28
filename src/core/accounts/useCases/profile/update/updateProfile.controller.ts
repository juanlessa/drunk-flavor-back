import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/infrastructure/fastify/constants/cookie.constants';
import { toJwtUserPayload } from '@/infrastructure/fastify/helpers/jwt.helpers';
import { UpdateUserProfileReqBody } from './updateProfile.dtos';
import { resolveUpdateUpdateProfileService } from './updateProfile.container';

export const updateProfileController: Controller<{ Body: UpdateUserProfileReqBody }> = async (request, reply) => {
	const { name, surname } = request.body;
	const { id } = request.user;

	const service = resolveUpdateUpdateProfileService();
	const { user } = await service.execute({ id, name, surname });
	const tokenPayload = toJwtUserPayload(user);
	const accessToken = await reply.jwtSign(tokenPayload, { sign: { sub: user.id } });
	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	const session = request.session.get(AUTH_SESSION);
	if (session) {
		const refreshToken = await reply.sessionJwtSign(tokenPayload, { sign: { sub: user.id } });
		request.session.set(AUTH_SESSION, {
			...session,
			refreshToken,
			userRole: user.role,
			userStatus: user.status,
			sessionVersion: user.sessionVersion,
		});
	}

	return reply.status(HTTP_STATUS.no_content).send();
};
