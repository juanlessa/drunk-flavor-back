import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteUserService } from './DeleteUserService';

interface IRequest {
	id: string;
}

class DeleteUserController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id }: IRequest = request.body;
		const deleteUserService = container.resolve(DeleteUserService);

		await deleteUserService.execute({ id });

		return response.status(201).send();
	}
}

export { DeleteUserController };
