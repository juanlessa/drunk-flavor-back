import Ingredient from '@modules/drinks/entities/Ingredient';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateIngredientService } from './CreateIngredientService';

class CreateIngredientController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { name, unitySingular, unityPlural, categoryId, isAlcoholic }: Ingredient = request.body;

		const createIngredientService = container.resolve(CreateIngredientService);

		await createIngredientService.execute({
			name,
			unitySingular,
			unityPlural,
			categoryId,
			isAlcoholic
		});

		return response.status(201).send();
	}
}

export { CreateIngredientController };
