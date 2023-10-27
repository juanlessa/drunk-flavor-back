import { IUpdateUserRole } from '@modules/accounts/dtos/user.dtos';
import { resolveUpdateUserRoleService } from '@modules/accounts/useCases/updateUserRole/updateUserRole.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class UpdateUserRoleController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { user_id, role }: IUpdateUserRole = request.body;

		const service = resolveUpdateUserRoleService();

		await service.execute({ user_id, role });

		return response.status(204).send();
	}
}

export { UpdateUserRoleController };
