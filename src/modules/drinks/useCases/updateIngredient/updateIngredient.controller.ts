import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateIngredientService } from './updateIngredient.service';
import { IUpdateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';

class UpdateIngredientController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id, translations, is_alcoholic, category_id }: IUpdateIngredientRequest = request.body;

		const updateIngredientService = container.resolve(UpdateIngredientService);

		await updateIngredientService.execute({ id, translations, is_alcoholic, category_id });

		return response.status(204).send();
	}
}

export { UpdateIngredientController };
