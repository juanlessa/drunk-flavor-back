import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveDeleteIngredientService } from './deleteIngredient.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { DeleteIngredientReqBody } from './deleteIngredient.dtos';

export const deleteIngredientController: Controller<{ Body: DeleteIngredientReqBody }> = async (request, reply) => {
	const { id } = request.body;

	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveDeleteIngredientService();

	await service.execute({ id, actor });

	return reply.status(HTTP_STATUS.no_content).send();
};
