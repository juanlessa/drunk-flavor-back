import { Controller } from '@/infra/fastify/types/fastify.types';
import { resolveDeleteIngredientService } from './deleteIngredient.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { DeleteIngredientReqBody } from './deleteIngredient.dtos';

export const deleteIngredientController: Controller = async (request, reply) => {
	const { id } = request.body as DeleteIngredientReqBody;

	const service = resolveDeleteIngredientService();

	await service.execute({ id });

	return reply.status(HTTP_STATUS.no_content).send();
};
