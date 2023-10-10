import { IUpdateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateDrinkService } from './UpdateDrink.service';

class UpdateDrinkController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id, translations, ingredients }: IUpdateDrinkRequest = request.body;

		const updateDrinkService = container.resolve(UpdateDrinkService);

		await updateDrinkService.execute({ id, translations, ingredients });
		return response.status(204).send();
	}
}

export { UpdateDrinkController };
