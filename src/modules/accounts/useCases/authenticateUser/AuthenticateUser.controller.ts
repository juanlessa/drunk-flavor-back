import { IAuthenticateUser } from '@modules/accounts/dtos/authentication.dtos';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveAuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/authenticateUser.container';

class AuthenticateUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { password, email }: IAuthenticateUser = request.body;

		const service = resolveAuthenticateUserService();

		const tokens = await service.execute({
			password,
			email
		});

		return response.json(tokens);
	}
}

export { AuthenticateUserController };
