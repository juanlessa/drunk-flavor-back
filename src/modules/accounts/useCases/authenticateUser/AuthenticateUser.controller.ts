import { IAuthenticateUser } from '@modules/accounts/dtos/authentication.dtos';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveAuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/authenticateUser.container';
import { cookiesConfig } from '@config/cookies';

class AuthenticateUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { password, email }: IAuthenticateUser = request.body;

		const service = resolveAuthenticateUserService();

		const { user, accessToken, refreshToken } = await service.execute({
			password,
			email
		});

		request.session.refreshToken = {
			refreshToken: refreshToken,
			userId: user.name
		};
		response.cookie('authorization', accessToken, cookiesConfig);

		return response.json(user);
	}
}

export { AuthenticateUserController };
