import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { GetUserProfile } from './getUserProfile.dtos';
import { omitUserPassword } from '@/core/accounts/mappers/user.mappers';
import { NotFoundError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '@/core/accounts/constants/users.constants';

export class GetUserProfileService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id }: GetUserProfile) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundError(USER_MESSAGES.notExist.message, { path: 'GetUserProfile.service' });
		}

		return omitUserPassword(user);
	}
}
