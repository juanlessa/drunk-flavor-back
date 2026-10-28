import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { assertCurrentSessionVersion } from '@/core/accounts/policies/SessionVersion.policy';
import { RefreshToken } from './refreshToken.dtos';
import { UserStatuses } from '@/core/accounts/constants/user.constants';

export class RefreshTokenService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ userId, sessionVersion }: RefreshToken) {
		const user = await this.usersRepository.findById(userId);
		if (!user || (user.status !== UserStatuses.active && user.status !== UserStatuses.incomplete_profile)) {
			throw new SessionRevokedError({
				path: 'RefreshToken.service',
				cause: 'The refresh session user is missing or inactive',
			});
		}

		assertCurrentSessionVersion(user, sessionVersion, 'RefreshToken.service');
		return user;
	}
}
