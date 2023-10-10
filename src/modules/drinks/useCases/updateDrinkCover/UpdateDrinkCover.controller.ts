import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';

class UpdateDrinkCoverController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id } = request.params;

		let coverFile = request.file.key;
		if (!coverFile) {
			coverFile = request.file.filename;
		}

		const updateDrinkCoverService = container.resolve(UpdateDrinkCoverService);

		await updateDrinkCoverService.execute({ drink_id: id, cover_file: coverFile });

		return response.status(204).send();
	}
}

export { UpdateDrinkCoverController };
