import { resolveUpdateUserProfileService } from './updateUserProfile.container';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';
import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { UpdateUserReqBody } from './updateUserProfile.dtos';

export const updateUserProfileController: Controller = async (request, reply) => {
	const { name, surname, email, password } = request.body as UpdateUserReqBody;
	const { id } = request.user;

	const service = resolveUpdateUserProfileService();

	await service.execute({ id, name, email, surname, password });

	return reply.status(HTTP_STATUS.no_content).send();
};
