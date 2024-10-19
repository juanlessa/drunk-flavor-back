import { resolveCreateUserService } from './createUser.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { CreateUserReqBody } from './createUser.dtos';

export const createUserController: Controller<{ Body: CreateUserReqBody }> = async (request, response) => {
	const { name, surname, email, password, role } = request.body;

	const service = resolveCreateUserService();

	await service.execute({ name, email, surname, password, role });

	return response.status(HTTP_STATUS.created).send();
};
