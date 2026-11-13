import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { loadCurrentSession } from '@/core/accounts/helpers/session.helpers';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { RefreshTokenCommand } from './refreshToken.dtos';

export class RefreshTokenService {
	constructor(private usersRepository: IUsersRepository) {}

	execute({ userId, sessionVersion }: RefreshTokenCommand): Promise<AuthenticatedSession> {
		return loadCurrentSession(this.usersRepository, { id: userId, sessionVersion }, 'RefreshToken.service');
	}
}
