import { Request, Response, NextFunction } from 'express';
import { UsersRepository } from '@modules/accounts/infra/prisma/repositories/UsersRepository';
import AppError from '@errors/AppError';

const roles = {
	ADMIN: 'admin'
};

export async function isUserAdmin(request: Request, response: Response, next: NextFunction) {
	const { id: userId } = request.user;
	if (!userId) {
		throw new AppError('user is not authenticated', 401);
	}

	const usersRepository = new UsersRepository();

	const user = await usersRepository.findById(userId);
	if (!user) {
		throw new AppError('User does not exist', 401);
	}

	if (user.role !== roles.ADMIN) {
		throw new AppError('Invalid permission', 403);
	}
	next();
}
