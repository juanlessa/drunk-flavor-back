import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UpdateDrinkCoverReqParam } from './updateDrinkCover.dtos';
import { resolveUpdateDrinkCoverService } from './updateDrinkCover.container';

export const updateDrinkCoverController: Controller<{ Params: UpdateDrinkCoverReqParam }> = async (request, reply) => {
	const { id } = request.params;
	const actor = { id: request.user.id, role: request.user.role };
	const data = await request.file();

	if (!data) {
		throw new Error('error processing file');
	}

	const service = resolveUpdateDrinkCoverService();

	await service.execute({
		drinkId: id,
		fileStream: data.file,
		name: data.filename,
		mimetype: data.mimetype,
		actor,
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
