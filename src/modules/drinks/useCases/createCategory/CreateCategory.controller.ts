import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { ICategory } from '@modules/drinks/entities/category.entity';
import { resolveCreateCategoryService } from '@modules/drinks/useCases/createCategory/createCategory.container';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

class CreateCategoryController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { translations }: ICategory = request.body;

		const service = resolveCreateCategoryService();

		await service.execute({ translations });

		return response.status(HTTP_STATUS.created).send();
	}
}

export { CreateCategoryController };
