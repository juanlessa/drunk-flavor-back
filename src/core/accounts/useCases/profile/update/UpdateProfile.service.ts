import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateProfile, UpdateProfileResult } from './updateProfile.dtos';

export class UpdateProfileService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id, name, surname }: UpdateProfile): Promise<UpdateProfileResult> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'UpdateProfile.service' });
		}

		const hasCompleteProfile = name.trim().length > 0 && surname.trim().length > 0;
		const shouldComplete = user.status === UserStatuses.incomplete_profile && hasCompleteProfile;

		const updated = await this.usersRepository.update({
			id,
			name,
			surname,
			...(shouldComplete ? { status: UserStatuses.active } : {}),
		});

		return {
			user: {
				id: updated.id,
				role: updated.role,
				status: updated.status,
			},
		};
	}
}
