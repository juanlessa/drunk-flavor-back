import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { GetUser } from './getUser.dtos';
import { omitUserPassword } from '@/core/accounts/mappers/user.mappers';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetUserService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id }: GetUser) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'GetUser.service' });
		}
		return omitUserPassword(user);
	}
}
