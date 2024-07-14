import { Controller } from '@/infra/fastify/types/fastify.types';
import { resolveGetUserProfileService } from './getUserProfile.container';

export const getUserProfileController: Controller = async (request, reply) => {
	const { id } = request.user;

	const service = resolveGetUserProfileService();

	const user = await service.execute({ id });

	return reply.send(user);
};
