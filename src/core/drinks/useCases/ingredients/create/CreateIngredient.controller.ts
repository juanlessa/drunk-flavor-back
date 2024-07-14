import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { CreateIngredientReqBody } from './createIngredient.dtos';
import { resolveCreateIngredientService } from './createIngredient.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';

export const createIngredientController: Controller = async (request, reply) => {
	const { translations, category_id, is_alcoholic } = request.body as CreateIngredientReqBody;

	const service = resolveCreateIngredientService();

	await service.execute({ translations, category_id, is_alcoholic });

	return reply.status(HTTP_STATUS.created).send();
};
