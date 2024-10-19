import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { UpdatePassword } from './updatePassword.dtos';

export class UpdatePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ id, currentPassword, newPassword }: UpdatePassword) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'UpdatePassword.service.1' });
		}

		const currentPasswordMatch = await this.hashProvider.compare(currentPassword, user.password);
		if (!currentPasswordMatch) {
			throw new BadRequestError('apiResponses.users.invalidCurrentPassword', {
				path: 'UpdatePassword.service.2',
			});
		}

		const isNewPasswordSameAsCurrent = await this.hashProvider.compare(newPassword, user.password);
		if (isNewPasswordSameAsCurrent) {
			throw new BadRequestError('apiResponses.users.newPasswordCannotMatchCurrent', {
				path: 'UpdatePassword.service.3',
			});
		}

		const hashedPassword = await this.hashProvider.hash(newPassword);

		await this.usersRepository.update({ id: user._id.toString(), password: hashedPassword });
	}
}
