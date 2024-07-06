import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { GetUserProfile } from './getUserProfile.dtos';
import { omitUserPassword } from '@/modules/accounts/mappers/user.mappers';
import { NotFoundError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '@/shared/constants/ResponseMessages';

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
