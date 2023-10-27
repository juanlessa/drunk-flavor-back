import { resolveUpdateDrinkCoverService } from './updateDrinkCover.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class UpdateDrinkCoverController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.params;

		let coverFile = request.file.key;
		if (!coverFile) {
			coverFile = request.file.filename;
		}

		const service = resolveUpdateDrinkCoverService();

		await service.execute({ drink_id: id, cover_file: coverFile });

		return response.status(204).send();
	}
}

export { UpdateDrinkCoverController };
