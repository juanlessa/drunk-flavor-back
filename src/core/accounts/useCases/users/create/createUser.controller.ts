import { resolveCreateUserService } from './createUser.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { CreateUserReqBody } from './createUser.dtos';
import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';

export const createUserController: Controller<{ Body: CreateUserReqBody }> = async (request, response) => {
	const { name, surname, email, password, role } = request.body;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveCreateUserService();

	await service.execute({
		name,
		email,
		surname,
		password,
		role,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return response.status(HTTP_STATUS.created).send();
};
