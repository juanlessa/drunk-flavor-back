import { IUpdateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';
import { resolveUpdateIngredientService } from './updateIngredient.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

class UpdateIngredientController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id, translations, is_alcoholic, category_id }: IUpdateIngredientRequest = request.body;

		const service = resolveUpdateIngredientService();

		await service.execute({ id, translations, is_alcoholic, category_id });

		return response.status(HTTP_STATUS.no_content).send();
	}
}

export { UpdateIngredientController };
