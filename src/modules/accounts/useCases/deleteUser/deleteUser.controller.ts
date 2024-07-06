import { resolveDeleteUserService } from '@/modules/accounts/useCases/deleteUser/deleteUser.container';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';
import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { deleteUserReqBody } from './deleteUser.dtos';

export const deleteUserController: Controller = async (request, reply) => {
	const { id } = request.body as deleteUserReqBody;

	const service = resolveDeleteUserService();

	await service.execute({ id });

	return reply.status(HTTP_STATUS.no_content).send();
};
