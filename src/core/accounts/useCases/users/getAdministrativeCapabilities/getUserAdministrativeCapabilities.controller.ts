import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUserAdministrativeCapabilitiesService } from './getUserAdministrativeCapabilities.container';
import { GetUserAdministrativeCapabilitiesReqParams } from './getUserAdministrativeCapabilities.dtos';

export const getUserAdministrativeCapabilitiesController: Controller<{
	Params: GetUserAdministrativeCapabilitiesReqParams;
}> = async (request, reply) => {
	const capabilities = await resolveGetUserAdministrativeCapabilitiesService().execute({
		id: request.params.id,
		actor: { id: request.user.id, role: request.user.role },
	});
	return reply.send(capabilities);
};
