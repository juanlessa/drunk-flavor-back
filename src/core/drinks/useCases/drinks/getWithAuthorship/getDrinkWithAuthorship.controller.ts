import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetDrinkWithAuthorshipService } from './getDrinkWithAuthorship.container';
import { GetDrinkWithAuthorshipReqParam } from './getDrinkWithAuthorship.dtos';

export const getDrinkWithAuthorshipController: Controller<{ Params: GetDrinkWithAuthorshipReqParam }> = async (
	request,
	reply,
) => {
	const { id } = request.params;
	const service = resolveGetDrinkWithAuthorshipService();
	const drink = await service.execute({ id });
	return reply.send(drink);
};
