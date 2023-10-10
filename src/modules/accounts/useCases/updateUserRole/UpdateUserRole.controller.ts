import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateUserRoleService } from './UpdateUserRole.service';
import { IUpdateUserRole } from '@modules/accounts/dtos/user.dtos';

class UpdateUserRoleController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { user_id, role }: IUpdateUserRole = request.body;

		const updateUserRoleService = container.resolve(UpdateUserRoleService);

		await updateUserRoleService.execute({ user_id, role });

		return response.status(204).send();
	}
}

export { UpdateUserRoleController };
