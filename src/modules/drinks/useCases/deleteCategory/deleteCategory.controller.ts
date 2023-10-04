import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteCategoryService } from './DeleteCategory.service';
import { IDeleteCategory } from '@modules/drinks/dtos/category.dtos';

class DeleteCategoryController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id }: IDeleteCategory = request.body;

		const deleteCategoryService = container.resolve(DeleteCategoryService);

		await deleteCategoryService.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteCategoryController };
