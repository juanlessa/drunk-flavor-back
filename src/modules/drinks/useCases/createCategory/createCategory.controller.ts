import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateCategoryService } from './CreateCategory.service';
import { ICategory } from '@modules/drinks/entities/category.entity';

class CreateCategoryController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { translations }: ICategory = request.body;

		const createCategoryService = container.resolve(CreateCategoryService);

		await createCategoryService.execute({
			translations
		});

		return response.status(201).send();
	}
}

export { CreateCategoryController };
