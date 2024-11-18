import { Login } from './login.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { UserStatusEnum } from '@/core/accounts/entities/user.entity';

export class LoginService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ email, password }: Login) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError('apiResponses.auth.invalidCredentials', {
				path: 'Login.service.1',
				cause: 'invalid email',
			});
		}
		if (user.status !== UserStatusEnum['active']) {
			throw new BadRequestError('apiResponses.auth.inactiveAccount', {
				path: 'Login.service.2',
				cause: 'invalid email',
			});
		}

		const passwordMatch = await this.hashProvider.compare(password, user.password);
		if (!passwordMatch) {
			throw new BadRequestError('apiResponses.auth.invalidCredentials', {
				path: 'Login.service.3',
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
