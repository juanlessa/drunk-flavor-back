import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteUserService } from './DeleteUser.service';
import { IDeleteUser } from '@modules/accounts/dtos/user.dtos';

class DeleteUserController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id }: IDeleteUser = request.body;

		const deleteUserService = container.resolve(DeleteUserService);

		await deleteUserService.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteUserController };
