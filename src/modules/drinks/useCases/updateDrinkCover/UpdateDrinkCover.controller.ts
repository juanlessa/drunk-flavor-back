import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { resolveUpdateDrinkCoverService } from './updateDrinkCover.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { ServerError } from '@shared/errors/error.lib';

class UpdateDrinkCoverController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.params;

		let coverFile: string;
		if (!request.file) {
			throw new ServerError('Upload file error', {
				path: 'UpdateDrinkCover.controller',
				cause: 'request.file does not exit'
			});
		}
		coverFile = request.file.key || request.file.filename;

		const service = resolveUpdateDrinkCoverService();

		await service.execute({ drink_id: id, cover_file: coverFile });

		return response.status(HTTP_STATUS.no_content).send();
	}
}

export { UpdateDrinkCoverController };
