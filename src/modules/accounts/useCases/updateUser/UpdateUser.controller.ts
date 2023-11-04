import { IUpdateUserRequest } from '@modules/accounts/dtos/user.dtos';
import { resolveUpdateUserService } from '@modules/accounts/useCases/updateUser/updateUser.container';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class UpdateUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { name, surname, email, password }: IUpdateUserRequest = request.body;
		const { id } = request.user;

		const service = resolveUpdateUserService();

		await service.execute({ id, name, email, surname, password });

		return response.status(HTTP_STATUS.no_content).send();
	}
}

export { UpdateUserController };
