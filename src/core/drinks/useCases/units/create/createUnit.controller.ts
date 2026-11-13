import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateUnitService } from './createUnit.container';
import { CreateUnitReqBody } from './createUnit.dtos';

export const createUnitController: Controller<{ Body: CreateUnitReqBody }> = async (request, reply) => {
	const { translations, symbol, spaceBeforeSymbol, allowDecimal, kind, useIngredientName } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveCreateUnitService();
	await service.execute({ translations, symbol, spaceBeforeSymbol, allowDecimal, kind, useIngredientName, actor });
	return reply.status(HTTP_STATUS.created).send();
};
