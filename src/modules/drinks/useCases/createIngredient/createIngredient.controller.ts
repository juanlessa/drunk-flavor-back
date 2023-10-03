import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateIngredientService } from './createIngredient.service';
import { ICreateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';

class CreateIngredientController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { translations, category_id, is_alcoholic }: ICreateIngredientRequest = request.body;

		const createIngredientService = container.resolve(CreateIngredientService);

		await createIngredientService.execute({ translations, category_id, is_alcoholic });

		return response.status(201).send();
	}
}

export { CreateIngredientController };
