import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { GetCategoryService } from './GetCategoryService';

class GetCategoryController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id } = request.params;

		const getCategoryService = container.resolve(GetCategoryService);

		const category = await getCategoryService.execute({ id });

		return response.json(category);
	}
}

export { GetCategoryController };
