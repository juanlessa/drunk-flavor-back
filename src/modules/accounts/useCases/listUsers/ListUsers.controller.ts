import { resolveListUsersService } from '@modules/accounts/useCases/listUsers/listUsers.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class ListUsersController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id: adminId } = request.user;

		const service = resolveListUsersService();

		const users = await service.execute(adminId);

		return response.json(users);
	}
}

export { ListUsersController };
