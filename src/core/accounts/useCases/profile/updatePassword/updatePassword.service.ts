import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { UpdatePassword } from './updatePassword.dtos';

export class UpdatePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ id, currentPassword, newPassword }: UpdatePassword) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'UpdatePassword.service.1' });
		}

		const credential = await this.credentialsRepository.findByUserId(user._id.toString());
		if (!credential) {
			throw new BadRequestError('apiResponses.users.invalidCurrentPassword', {
				path: 'UpdatePassword.service.credential',
			});
		}

		const currentPasswordMatch = await this.hashProvider.compare(currentPassword, credential.password_hash);
		if (!currentPasswordMatch) {
			throw new BadRequestError('apiResponses.users.invalidCurrentPassword', {
				path: 'UpdatePassword.service.2',
			});
		}

		const isNewPasswordSameAsCurrent = await this.hashProvider.compare(newPassword, credential.password_hash);
		if (isNewPasswordSameAsCurrent) {
			throw new BadRequestError('apiResponses.users.newPasswordCannotMatchCurrent', {
				path: 'UpdatePassword.service.3',
			});
		}

		const hashedPassword = await this.hashProvider.hash(newPassword);

		await this.credentialsRepository.update({ user_id: user._id.toString(), password_hash: hashedPassword });
	}
}
