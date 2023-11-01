import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveGetCategoryService } from '@modules/drinks/useCases/getCategory/getCategory.container';

class GetCategoryController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.params;

		const service = resolveGetCategoryService();

		const category = await service.execute({ id });

		return response.json(category);
	}
}

export { GetCategoryController };
