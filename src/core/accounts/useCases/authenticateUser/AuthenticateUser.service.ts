import { AuthenticateUser } from './authenticateUser.dtos';
import { AUTHENTICATION_MESSAGES } from '@/core/accounts/constants/users.constants';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';

export class AuthenticateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ email, password }: AuthenticateUser) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError(AUTHENTICATION_MESSAGES.invalidCredentials.message, {
				path: 'AuthenticateUser.service.1',
				cause: 'invalid email',
			});
		}

		const passwordMatch = await this.hashProvider.compare(password, user.password);
		if (!passwordMatch) {
			throw new BadRequestError(AUTHENTICATION_MESSAGES.invalidCredentials.message, {
				path: 'AuthenticateUser.service.2',
				cause: 'Error on hashProvider.compare',
			});
		}

		return {
			user: {
				id: user._id.toString(),
				role: user.role,
			},
		};
	}
}
