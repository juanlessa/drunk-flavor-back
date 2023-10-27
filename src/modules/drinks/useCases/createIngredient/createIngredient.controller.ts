import { ICreateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';
import { resolveCreateIngredientService } from './createIngredient.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class CreateIngredientController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { translations, category_id, is_alcoholic }: ICreateIngredientRequest = request.body;

		const service = resolveCreateIngredientService();

		await service.execute({ translations, category_id, is_alcoholic });

		return response.status(201).send();
	}
}

export { CreateIngredientController };
