import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateUserRoleService } from './UpdateUserRoleService';

interface IRequest {
	id: string;
	role: string;
}

class UpdateUserRoleController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id, role }: IRequest = request.body;

		const updateUserRoleService = container.resolve(UpdateUserRoleService);

		await updateUserRoleService.execute({ userId: id, role });

		return response.status(201).send();
	}
}

export { UpdateUserRoleController };
