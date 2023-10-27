import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { ICategory } from '@modules/drinks/entities/category.entity';
import { resolveCreateCategoryService } from './createCategory.container';

class CreateCategoryController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { translations }: ICategory = request.body;

		const service = resolveCreateCategoryService();

		await service.execute({ translations });

		return response.status(201).send();
	}
}

export { CreateCategoryController };
