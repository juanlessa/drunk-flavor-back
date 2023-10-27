import { resolveProfileUserService } from '@modules/accounts/useCases/profileUser/profileUser.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class ProfileUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.user;

		const service = resolveProfileUserService();

		const user = await service.execute({ id });

		return response.json(user);
	}
}

export { ProfileUserController };
