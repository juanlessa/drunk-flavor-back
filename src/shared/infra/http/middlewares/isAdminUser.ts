import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { AppNextFunction, AppRequest, AppResponse } from '../types';
import { ForbiddenError, UnauthorizedError } from '@shared/errors/error.lib';

export async function isUserAdmin(request: AppRequest, response: AppResponse, next: AppNextFunction) {
	const { id: userId } = request.user;
	if (!userId) {
		throw new UnauthorizedError(AUTHENTICATION_ERRORS.not_authenticated, { path: 'isUserAdmin.middleware' });
	}

	const usersRepository = new UsersRepository();

	const user = await usersRepository.findById(userId);
	if (!user) {
		throw new UnauthorizedError(USER_ERRORS.not_exist, { path: 'isUserAdmin.middleware' });
	}

	if (user.role !== ROLES.admin) {
		throw new ForbiddenError(AUTHENTICATION_ERRORS.invalid_permission, { path: 'isUserAdmin.middleware' });
	}
	next();
}
