import { IDeleteIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { resolveDeleteIngredientService } from '@modules/drinks/useCases/deleteIngredient/deleteIngredient.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class DeleteIngredientController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id }: IDeleteIngredient = request.body;

		const service = resolveDeleteIngredientService();

		await service.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteIngredientController };
