import { IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { resolveUpdateCategoryService } from '@modules/drinks/useCases/updateCategory/updateCategory.container';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class UpdateCategoryController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id, translations }: IUpdateCategory = request.body;

		const service = resolveUpdateCategoryService();

		await service.execute({ id, translations });

		return response.status(HTTP_STATUS.no_content).send();
	}
}

export { UpdateCategoryController };
