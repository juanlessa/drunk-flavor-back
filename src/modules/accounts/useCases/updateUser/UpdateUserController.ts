import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UpdateUserService } from './UpdateUserService';

interface IRequest {
	name: string;
	surname: string;
	email: string;
	password: string;
}

class UpdateUserController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { name, surname, email, password }: IRequest = request.body;
		const { id } = request.user;

		const updateUserService = container.resolve(UpdateUserService);

		await updateUserService.execute({
			id,
			name,
			email,
			surname,
			password
		});

		return response.status(201).send();
	}
}

export { UpdateUserController };
