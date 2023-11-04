import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveUpdateDrinkThumbnailService } from './updateDrinkThumbnail.container';
import { ServerError } from '@shared/errors/error.lib';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

class UpdateDrinkThumbnailController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.params;

		let thumbnailFile: string;
		if (!request.file) {
			throw new ServerError('Upload file error', {
				path: 'UpdateDrinkCover.controller',
				cause: 'request.file does not exit'
			});
		}
		thumbnailFile = request.file.key || request.file.filename;

		const service = resolveUpdateDrinkThumbnailService();

		await service.execute({ drink_id: id, thumbnail_file: thumbnailFile });

		return response.status(HTTP_STATUS.no_content).send();
	}
}

export { UpdateDrinkThumbnailController };
