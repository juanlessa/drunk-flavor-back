import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ListUsers } from './listUsers.dtos';
import { defineAbilityFor } from '@/shared/accessControl';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { ForbiddenError } from '@/shared/error/error.lib';

export class ListUsersService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ query = {}, actor }: ListUsers) {
		const user = userPermissionSchema.parse({ id: actor.id, role: actor.role });
		const { cannot } = defineAbilityFor(user);
		if (cannot('list', 'User')) {
			throw new ForbiddenError('apiResponses.users.forbidden', { path: 'ListUsers.service' });
		}

		const users = await this.usersRepository.findAll(query);

		return users;
	}
}
