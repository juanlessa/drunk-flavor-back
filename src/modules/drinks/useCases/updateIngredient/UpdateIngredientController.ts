import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateIngredientService } from './UpdateIngredientService';
import { IUpdateIngredient } from '@modules/drinks/dtos/ingredients';

class UpdateIngredientController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id, name, categoryId, isAlcoholic, unitySingular, unityPlural }: IUpdateIngredient = request.body;

		const updateIngredientService = container.resolve(UpdateIngredientService);

		await updateIngredientService.execute({ id, name, categoryId, isAlcoholic, unitySingular, unityPlural });

		return response.status(204).send();
	}
}

export { UpdateIngredientController };
