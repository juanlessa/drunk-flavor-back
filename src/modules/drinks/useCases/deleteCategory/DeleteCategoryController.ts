import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteCategoryService } from './DeleteCategoryService';

interface IRequest {
	id: string;
}

class DeleteCategoryController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id }: IRequest = request.body;

		const deleteCategoryService = container.resolve(DeleteCategoryService);

		await deleteCategoryService.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteCategoryController };
