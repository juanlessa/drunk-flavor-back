import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { GetUser } from './getUser.dtos';
import { omitUserPassword } from '@/core/accounts/mappers/user.mappers';
import { ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { defineAbilityFor } from '@/shared/accessControl';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';

export class GetUserService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id, actor }: GetUser) {
		const permissionUser = userPermissionSchema.parse({ id: actor.id, role: actor.role });
		const { cannot } = defineAbilityFor(permissionUser);
		if (cannot('get', 'User')) {
			throw new ForbiddenError('apiResponses.users.forbidden', { path: 'GetUser.service' });
		}

		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'GetUser.service' });
		}
		return omitUserPassword(user);
	}
}
