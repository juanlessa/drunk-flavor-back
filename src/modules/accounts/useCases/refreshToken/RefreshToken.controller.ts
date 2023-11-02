import { resolveRefreshTokenService } from '@modules/accounts/useCases/refreshToken/refreshToken.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class RefreshTokenController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const token = request.body.token || request.headers['x-access-token'] || request.query.token;

		const service = resolveRefreshTokenService();

		const tokenResponse = await service.execute({ token });

		return response.json(tokenResponse);
	}
}

export { RefreshTokenController };
