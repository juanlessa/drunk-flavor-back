import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveDeleteProfileService } from './deleteProfile.container';

export const deleteProfileController: Controller = async (request, reply) => {
	const { id } = request.user;

	const service = resolveDeleteProfileService();

	await service.execute({ id });

	return reply.status(HTTP_STATUS.no_content).send();
};
