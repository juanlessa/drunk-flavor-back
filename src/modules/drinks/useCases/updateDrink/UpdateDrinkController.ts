import { IUpdateDrink } from '@modules/drinks/dtos/Drinks';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateDrinkService } from './UpdateDrinkService';

class UpdateDrinkController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id, name, method, ingredients }: IUpdateDrink = request.body;

		const updateDrinkService = container.resolve(UpdateDrinkService);

		await updateDrinkService.execute({ id, name, method, ingredients });
		return response.status(204).send();
	}
}

export { UpdateDrinkController };
