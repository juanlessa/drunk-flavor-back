import { UpdateUserRole } from '@/core/accounts/dtos/user.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { defineAbilityFor } from '@/shared/accessControl';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';

export class UpdateUserRoleService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ user_id, role, actor }: UpdateUserRole) {
		const permissionUser = userPermissionSchema.parse({ id: actor.id, role: actor.role });
		const { cannot } = defineAbilityFor(permissionUser);
		if (cannot('update', 'User')) {
			throw new ForbiddenError('apiResponses.users.forbidden', { path: 'UpdateUserRole.service' });
		}

		const user = await this.usersRepository.findById(user_id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'UpdateUserRole.service' });
		}

		await this.usersRepository.update({ id: user_id, role });
	}
}
