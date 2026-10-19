import { Signin } from './signin.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { UserStatusEnum } from '@/core/accounts/entities/user.entity';

export class SigninService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ email, password }: Signin) {
		const user = await this.usersRepository.findByEmail(email);

		const hashToCompare = user ? user.password : await this.hashProvider.getDummyHash();
		const passwordMatch = await this.hashProvider.compare(password, hashToCompare);

		if (!user) {
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'Signin.service.1',
				cause: 'nonexistent email',
			});
		}

		if (user.status !== UserStatusEnum['active']) {
			// TODO: trigger an "account inactive / verify your email" notification to
			// the user's address here. Guidance about the inactive account must be
			// delivered out-of-band (email), never in the sign-in response, so it
			// cannot be used to enumerate accounts.
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'Signin.service.2',
				cause: 'inactive account',
			});
		}

		if (!passwordMatch) {
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'Signin.service.3',
				cause: 'password mismatch',
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
