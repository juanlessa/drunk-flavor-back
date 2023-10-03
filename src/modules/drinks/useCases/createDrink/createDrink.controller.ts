import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateDrinkService } from './createDrink.service';
import { ICreateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';

class CreateDrinkController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { translations, ingredients }: ICreateDrinkRequest = request.body;

		const createDrinkService = container.resolve(CreateDrinkService);

		const drinkId = await createDrinkService.execute({ translations, ingredients });

		return response.status(201).json(drinkId);
	}
}

export { CreateDrinkController };
