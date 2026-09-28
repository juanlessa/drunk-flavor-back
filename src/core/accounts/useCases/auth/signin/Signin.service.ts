import { Signin } from './signin.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { UserStatusEnum } from '@/core/accounts/entities/user.entity';

export class SigninService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ email, password }: Signin) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError('apiResponses.auth.invalidCredentials', {
				path: 'Signin.service.1',
				cause: 'invalid email',
			});
		}
		if (user.status !== UserStatusEnum['active']) {
			throw new BadRequestError('apiResponses.auth.inactiveAccount', {
				path: 'Signin.service.2',
				cause: 'invalid email',
			});
		}

		const passwordMatch = await this.hashProvider.compare(password, user.password);
		if (!passwordMatch) {
			throw new BadRequestError('apiResponses.auth.invalidCredentials', {
				path: 'Signin.service.3',
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
