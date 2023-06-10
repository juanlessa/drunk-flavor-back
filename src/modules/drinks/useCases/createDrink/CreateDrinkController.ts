import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateDrinkService } from './CreateDrinkService';

interface IRequest {
	name: string;
	method: string;
	ingredients: { id: string; quantity: number }[];
}

class CreateDrinkController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { name, method, ingredients }: IRequest = request.body;

		const createDrinkService = container.resolve(CreateDrinkService);

		const drinkId = await createDrinkService.execute({
			name,
			method,
			ingredients
		});

		return response.status(201).json(drinkId);
	}
}

export { CreateDrinkController };
