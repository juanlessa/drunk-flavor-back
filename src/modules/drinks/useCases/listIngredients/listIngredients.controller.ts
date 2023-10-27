import { resolveListIngredientsService } from './listIngredients.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class ListIngredientsController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const service = resolveListIngredientsService();

		const ingredients = await service.execute();

		return response.json(ingredients);
	}
}

export { ListIngredientsController };
