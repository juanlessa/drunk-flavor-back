import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetDrinkWithAuthorshipService } from './getDrinkWithAuthorship.container';
import { GetDrinkWithAuthorshipReqParams } from './getDrinkWithAuthorship.dtos';

export const getDrinkWithAuthorshipController: Controller<{ Params: GetDrinkWithAuthorshipReqParams }> = async (
	request,
	reply,
) => {
	const drink = await resolveGetDrinkWithAuthorshipService().execute(request.params);
	return reply.send(drink);
};
