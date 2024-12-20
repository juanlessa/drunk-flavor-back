import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateDrinkThumbnailService } from './updateDrinkThumbnail.container';
import { UpdateDrinkThumbnailReqParams } from './updateDrinkThumbnail.dtos';

export const updateDrinkThumbnailController: Controller<{ Params: UpdateDrinkThumbnailReqParams }> = async (
	request,
	reply,
) => {
	const { id } = request.params;
	const data = await request.file();

	if (!data) {
		throw new Error('error processing file');
	}

	const service = resolveUpdateDrinkThumbnailService();

	await service.execute({
		drinkId: id,
		fileStream: data.file,
		name: data.filename,
		mimetype: data.mimetype,
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
