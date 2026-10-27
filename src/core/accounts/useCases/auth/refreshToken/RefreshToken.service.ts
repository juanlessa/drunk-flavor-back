import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { RefreshToken } from './refreshToken.dtos';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

export class RefreshTokenService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ userId }: RefreshToken) {
		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'RefreshToken.service' });
		}

		if (user.status !== 'active') {
			throw new BadRequestError('apiResponses.auth.inactiveAccount', { path: 'RefreshToken.service' });
		}

		return user;
	}
}
