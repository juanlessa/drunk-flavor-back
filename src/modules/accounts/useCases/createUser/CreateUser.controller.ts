import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateUserService } from './CreateUser.service';
import { ICreateUser } from '@modules/accounts/dtos/user.dtos';

class CreateUserController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { name, surname, email, password, role }: ICreateUser = request.body;
		const createUserService = container.resolve(CreateUserService);

		await createUserService.execute({ name, email, surname, password, role });

		return response.status(201).send();
	}
}

export { CreateUserController };
