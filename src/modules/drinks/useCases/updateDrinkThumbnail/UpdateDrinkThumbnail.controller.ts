import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveUpdateDrinkThumbnailService } from './updateDrinkThumbnail.container';

class UpdateDrinkThumbnailController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.params;

		let thumbnailFile = request.file.key;
		if (!thumbnailFile) {
			thumbnailFile = request.file.filename;
		}

		const service = resolveUpdateDrinkThumbnailService();

		await service.execute({ drink_id: id, thumbnail_file: thumbnailFile });

		return response.status(204).send();
	}
}

export { UpdateDrinkThumbnailController };
