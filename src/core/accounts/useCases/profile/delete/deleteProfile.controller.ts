import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveDeleteProfileService } from './deleteProfile.container';
import { signOut } from '@/infrastructure/fastify/middlewares/signOut';
import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';

export const deleteProfileController: Controller = async (request, reply) => {
	const { id } = request.user;

	const service = resolveDeleteProfileService();

	await service.execute({
		id,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	await signOut(request, reply);

	return reply.status(HTTP_STATUS.no_content).send();
};
