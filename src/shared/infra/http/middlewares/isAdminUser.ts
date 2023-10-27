import AppError from '@errors/AppError';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { AppNextFunction, AppRequest, AppResponse } from '../types';

export async function isUserAdmin(request: AppRequest, response: AppResponse, next: AppNextFunction) {
	const { id: userId } = request.user;
	if (!userId) {
		throw new AppError(AUTHENTICATION_ERRORS.not_authenticated, 401);
	}

	const usersRepository = new UsersRepository();

	const user = await usersRepository.findById(userId);
	if (!user) {
		throw new AppError(USER_ERRORS.not_exist, 401);
	}

	if (user.role !== ROLES.admin) {
		throw new AppError(AUTHENTICATION_ERRORS.invalid_permission, 403);
	}
	next();
}
