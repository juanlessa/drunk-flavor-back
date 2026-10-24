import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { DeleteUser } from './deleteUser.dtos';
import { defineAbilityFor } from '@/shared/accessControl';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';

export class DeleteUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
	) {}

	async execute({ id, actor }: DeleteUser) {
		const permissionUser = userPermissionSchema.parse({ id: actor.id, role: actor.role });
		const { cannot } = defineAbilityFor(permissionUser);
		if (cannot('delete', 'User')) {
			throw new ForbiddenError('apiResponses.users.forbidden', { path: 'DeleteUser.service' });
		}

		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'DeleteUser.service' });
		}

		await this.usersRepository.delete(id);
		// TODO: Enqueue engagement cleanup for comments and ratings by user id.
		await this.tokensRepository.deleteByUserId(id);
	}
}
