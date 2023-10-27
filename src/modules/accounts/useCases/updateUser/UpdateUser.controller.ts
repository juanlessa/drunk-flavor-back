import { IUpdateUserRequest } from '@modules/accounts/dtos/user.dtos';
import { resolveUpdateUserService } from './updateUser.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class UpdateUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { name, surname, email, password }: IUpdateUserRequest = request.body;
		const { id } = request.user;

		const service = resolveUpdateUserService();

		await service.execute({ id, name, email, surname, password });

		return response.status(204).send();
	}
}

export { UpdateUserController };
