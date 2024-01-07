import { IAuthenticateUser } from '@modules/accounts/dtos/authentication.dtos';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveAuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/authenticateUser.container';

class AuthenticateUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { password, email }: IAuthenticateUser = request.body;

		const service = resolveAuthenticateUserService();

		const { user, accessToken, refreshToken } = await service.execute({
			password,
			email
		});

		return response
			.cookie('authorization', accessToken.token, {
				path: '/',
				secure: true,
				sameSite: true,
				httpOnly: true
			})
			.json(user);
	}
}

export { AuthenticateUserController };
