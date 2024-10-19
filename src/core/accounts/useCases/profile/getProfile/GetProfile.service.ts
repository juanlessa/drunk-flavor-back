import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { GetProfile } from './getProfile.dtos';
import { omitUserPassword } from '@/core/accounts/mappers/user.mappers';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetProfileService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id }: GetProfile) {
		const user = await this.usersRepository.findById(id);

		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'GetProfile.service' });
		}

		return omitUserPassword(user);
	}
}
