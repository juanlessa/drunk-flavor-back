import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UpdateDrinkCoverReqParams } from './updateDrinkCover.dtos';
import { resolveUpdateDrinkCoverService } from './updateDrinkCover.container';

export const updateDrinkCoverController: Controller<{ Params: UpdateDrinkCoverReqParams }> = async (request, reply) => {
	const { id } = request.params;
	const data = await request.file();

	if (!data) {
		throw new Error('error processing file');
	}
	console.log('controller');
	console.log(data);

	const service = resolveUpdateDrinkCoverService();

	await service.execute({
		drinkId: id,
		fileStream: data.file,
		name: data.filename,
		mimetype: data.mimetype,
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
