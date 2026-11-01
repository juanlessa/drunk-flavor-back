import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { UpdateProfile, UpdateProfileResult } from './updateProfile.dtos';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { invalidateUserSessions } from '@/core/accounts/helpers/sessionInvalidation.helpers';

export class UpdateProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private transactionManager: ITransactionManager,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
	) {}

	async execute({ id, name, surname }: UpdateProfile): Promise<UpdateProfileResult> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'UpdateProfile.service' });
		}

		const hasCompleteProfile = name.trim().length > 0 && surname.trim().length > 0;
		const shouldComplete = user.status === UserStatuses.incomplete_profile && hasCompleteProfile;

		const updated = await this.transactionManager.withTransaction(async () => {
			const profileUpdated = await this.usersRepository.update({
				id,
				name,
				surname,
				...(shouldComplete ? { status: UserStatuses.active } : {}),
			});
			return shouldComplete
				? invalidateUserSessions(this.usersRepository, this.sessionVersionMarkerStore, id)
				: profileUpdated;
		});

		return {
			user: {
				id: updated.id,
				role: updated.role,
				status: updated.status,
				sessionVersion: updated.sessionVersion,
			},
		};
	}
}
