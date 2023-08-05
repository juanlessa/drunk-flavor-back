import { IUpdateCategory } from '@modules/drinks/dtos/Categories';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateCategoryService } from './UpdateCategoryService';

class UpdateCategoryController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id, name }: IUpdateCategory = request.body;

		const updateCategoryService = container.resolve(UpdateCategoryService);

		await updateCategoryService.execute({ id, name });

		return response.status(204).send();
	}
}

export { UpdateCategoryController };
