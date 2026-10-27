import { User } from '@/core/accounts/entities/user.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { NotFoundError } from '@/shared/error/error.lib';

export const findRequiredAdministrationUser = async (
	usersRepository: IUsersRepository,
	id: string,
	path: string,
): Promise<User> => {
	const user = await usersRepository.findById(id);
	if (!user) {
		throw new NotFoundError('apiResponses.users.notExist', { path });
	}
	return user;
};

export const toAdministrationActor = ({ id, role }: User): Actor => ({ id, role });
