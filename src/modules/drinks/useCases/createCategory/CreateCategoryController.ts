import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateCategoryService } from './CreateCategoryService';
import Category from '@modules/drinks/entities/Category';

class CreateCategoryController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { name }: Category = request.body;

		const createCategoryService = container.resolve(CreateCategoryService);

		await createCategoryService.execute({
			name
		});

		return response.status(201).send();
	}
}

export { CreateCategoryController };
