import { IDeleteUser } from '@modules/accounts/dtos/user.dtos';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveDeleteUserService } from '@modules/accounts/useCases/deleteUser/deleteUser.container';

class DeleteUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id }: IDeleteUser = request.body;

		const service = resolveDeleteUserService();

		await service.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteUserController };
