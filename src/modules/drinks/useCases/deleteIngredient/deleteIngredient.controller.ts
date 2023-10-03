import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteIngredientService } from './deleteIngredient.service';
import { IDeleteIngredient } from '@modules/drinks/dtos/ingredient.dtos';

class DeleteIngredientController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id }: IDeleteIngredient = request.body;

		const deleteIngredientService = container.resolve(DeleteIngredientService);

		await deleteIngredientService.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteIngredientController };
