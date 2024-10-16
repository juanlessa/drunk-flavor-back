import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { UpdateUserProfileReqBody } from './updateProfile.dtos';
import { resolveUpdateUpdateProfileService } from './updateProfile.container';

export const updateProfileController: Controller<{ Body: UpdateUserProfileReqBody }> = async (request, reply) => {
	const { name, surname } = request.body;
	const { id } = request.user;

	const service = resolveUpdateUpdateProfileService();

	await service.execute({ id, name, surname });

	return reply.status(HTTP_STATUS.no_content).send();
};
