import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUserAdministrativeCapabilitiesService } from './getUserAdministrativeCapabilities.container';
import { GetUserAdministrativeCapabilitiesReqParam } from './getUserAdministrativeCapabilities.dtos';

export const getUserAdministrativeCapabilitiesController: Controller<{
	Params: GetUserAdministrativeCapabilitiesReqParam;
}> = async (request, reply) => {
	const { id } = request.params;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveGetUserAdministrativeCapabilitiesService();
	const capabilities = await service.execute({ id, actor });
	return reply.send(capabilities);
};
