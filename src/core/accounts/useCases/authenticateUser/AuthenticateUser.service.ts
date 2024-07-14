import { AuthenticateUser } from './authenticateUser.dtos';
import { AUTHENTICATION_MESSAGES } from '@/core/accounts/constants/users.constants';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IEncryptionProvider } from '@/shared/providers/encryption/IEncryption.provider';
import { BadRequestError } from '@/shared/error/error.lib';

export class AuthenticateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private encryptionProvider: IEncryptionProvider,
	) {}

	async execute({ email, password }: AuthenticateUser) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError(AUTHENTICATION_MESSAGES.invalidCredentials.message, {
				path: 'AuthenticateUser.service.1',
				cause: 'invalid email',
			});
		}

		const passwordMatch = await this.encryptionProvider.compare(password, user.password);
		if (!passwordMatch) {
			throw new BadRequestError(AUTHENTICATION_MESSAGES.invalidCredentials.message, {
				path: 'AuthenticateUser.service.2',
				cause: 'Error on encryptionProvider.compare',
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
