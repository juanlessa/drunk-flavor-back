import { IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateCategoryService } from './updateCategory.service';

class UpdateCategoryController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id, translations }: IUpdateCategory = request.body;

		const updateCategoryService = container.resolve(UpdateCategoryService);

		await updateCategoryService.execute({ id, translations });

		return response.status(204).send();
	}
}

export { UpdateCategoryController };
