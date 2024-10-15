import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { CreateUserReqBody } from './signup.dtos';
import { resolveSignupService } from './signup.container';

export const signupController: Controller<{ Body: CreateUserReqBody }> = async (request, response) => {
	const { name, surname, email, password } = request.body;

	const service = resolveSignupService();

	await service.execute({ name, email, surname, password });

	return response.status(HTTP_STATUS.created).send();
};
