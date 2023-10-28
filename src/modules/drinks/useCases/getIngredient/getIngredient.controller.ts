import { resolveGetIngredientService } from '@modules/drinks/useCases/getIngredient/getIngredient.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class GetIngredientController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.params;

		const service = resolveGetIngredientService();

		const ingredient = await service.execute({ id });

		return response.json(ingredient);
	}
}

export { GetIngredientController };
