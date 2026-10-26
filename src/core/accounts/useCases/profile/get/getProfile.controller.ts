import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetProfileService } from './getProfile.container';

export const getProfileController: Controller = async (request, reply) => {
	const { id } = request.user;

	const service = resolveGetProfileService();

	const user = await service.execute({ id });

	return reply.send(user);
};
