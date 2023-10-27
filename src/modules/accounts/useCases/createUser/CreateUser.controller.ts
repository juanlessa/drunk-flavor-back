import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveCreateUserService } from '@modules/accounts/useCases/createUser/createUser.container';

class CreateUserController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { name, surname, email, password, role }: ICreateUser = request.body;

		const service = resolveCreateUserService();

		await service.execute({ name, email, surname, password, role });

		return response.status(201).send();
	}
}

export { CreateUserController };
