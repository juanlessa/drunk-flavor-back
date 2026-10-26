import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { DeleteUser } from './deleteUser.dtos';
import { defineAbilityFor } from '@/shared/accessControl';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';

export class DeleteUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
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

		await this.transactionManager.withTransaction(async () => {
			await this.usersRepository.delete(id);
			await this.credentialsRepository.deleteByUserId(id);
			await this.identitiesRepository.deleteByUserId(id);
			await this.tokensRepository.deleteByUserId(id);
		});
		// TODO: Enqueue engagement cleanup for comments and ratings by user id.
	}
}
