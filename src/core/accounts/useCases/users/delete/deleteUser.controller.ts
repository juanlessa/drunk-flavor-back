import { resolveDeleteUserService } from './deleteUser.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { DeleteUserReqBody } from './deleteUser.dtos';

export const deleteUserController: Controller<{ Body: DeleteUserReqBody }> = async (request, reply) => {
	const { id } = request.body;

	const service = resolveDeleteUserService();

	await service.execute({ id });

	return reply.status(HTTP_STATUS.no_content).send();
};
