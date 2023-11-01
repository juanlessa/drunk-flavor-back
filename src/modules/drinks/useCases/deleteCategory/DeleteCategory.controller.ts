import { IDeleteCategory } from '@modules/drinks/dtos/category.dtos';
import { resolveDeleteCategoryService } from '@modules/drinks/useCases/deleteCategory/deleteCategory.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class DeleteCategoryController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id }: IDeleteCategory = request.body;

		const service = resolveDeleteCategoryService();

		await service.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteCategoryController };
