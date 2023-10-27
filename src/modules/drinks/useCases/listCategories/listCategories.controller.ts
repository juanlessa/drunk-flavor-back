import { resolveListCategoriesService } from './listCategories.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class ListCategoriesController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const service = resolveListCategoriesService();

		const categories = await service.execute();

		return response.json(categories);
	}
}

export { ListCategoriesController };
