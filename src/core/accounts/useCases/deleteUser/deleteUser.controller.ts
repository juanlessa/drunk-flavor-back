import { resolveDeleteUserService } from '@/core/accounts/useCases/deleteUser/deleteUser.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { deleteUserReqBody } from './deleteUser.dtos';

export const deleteUserController: Controller = async (request, reply) => {
	const { id } = request.body as deleteUserReqBody;

	const service = resolveDeleteUserService();

	await service.execute({ id });

	return reply.status(HTTP_STATUS.no_content).send();
};
