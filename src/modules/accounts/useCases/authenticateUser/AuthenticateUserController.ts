import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AuthenticateUserService } from './AuthenticateUserService';

class AuthenticateUserController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { password, email } = request.body;
		const authenticateUserService = container.resolve(AuthenticateUserService);
		const tokens = await authenticateUserService.execute({
			password,
			email
		});

		return response.json(tokens);
	}
}

export { AuthenticateUserController };
