import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { CreatePassword } from './createPassword.dtos';

export class CreatePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ userId, password }: CreatePassword): Promise<void> {
		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', {
				path: 'CreatePassword.service.user',
			});
		}

		if (await this.credentialsRepository.existsByUserId(userId)) {
			throw new ConflictError('apiResponses.profile.passwordAlreadyConfigured', {
				path: 'CreatePassword.service.credential',
			});
		}

		const passwordHash = await this.hashProvider.hash(password);
		await this.credentialsRepository.create({ user_id: userId, password_hash: passwordHash });
	}
}
