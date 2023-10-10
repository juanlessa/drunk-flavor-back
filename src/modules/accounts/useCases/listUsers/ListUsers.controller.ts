import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ListUsersService } from './ListUsers.service';

class ListUsersController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id: adminId } = request.user;

		const listUsersService = container.resolve(ListUsersService);

		const users = await listUsersService.execute(adminId);

		return response.json(users);
	}
}

export { ListUsersController };
