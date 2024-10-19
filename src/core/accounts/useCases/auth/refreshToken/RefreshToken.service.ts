import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { RefreshToken } from './refreshToken.dtos';
import { omitUserPassword } from '@/core/accounts/mappers/user.mappers';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

export class RefreshTokenService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ user_id }: RefreshToken) {
		const user = await this.usersRepository.findById(user_id);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'RefreshToken.service' });
		}

		if (user.status !== 'active') {
			throw new BadRequestError('apiResponses.auth.inactiveAccount', { path: 'RefreshToken.service' });
		}

		return omitUserPassword(user);
	}
}
