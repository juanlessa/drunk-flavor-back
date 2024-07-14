import { resolveCreateUserService } from '@/core/accounts/useCases/createUser/createUser.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infra/fastify/types/fastify.types';
import { CreateUserReqBody } from './createUser.dtos';

export const createUserController: Controller = async (request, response) => {
	const { name, surname, email, password, role } = request.body as CreateUserReqBody;

	const service = resolveCreateUserService();

	await service.execute({ name, email, surname, password, role });

	return response.status(HTTP_STATUS.created).send();
};
