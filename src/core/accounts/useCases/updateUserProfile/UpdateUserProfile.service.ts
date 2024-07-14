import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IEncryptionProvider } from '@/shared/providers/encryption/IEncryption.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '@/core/accounts/constants/users.constants';
import { UpdateUserProfile } from './updateUserProfile.dtos';

export class UpdateUserProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private encryptionProvider: IEncryptionProvider,
	) {}

	async execute({ id, name, surname, password, email }: UpdateUserProfile) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError(USER_MESSAGES.notExist.message, { path: 'UpdateUser.service' });
		}

		const userEmailALreadyInUse = await this.usersRepository.findByEmail(email);
		if (userEmailALreadyInUse && userEmailALreadyInUse._id.toString() !== user._id.toString()) {
			throw new BadRequestError(USER_MESSAGES.alreadyExist.message, { path: 'UpdateUser.service' });
		}

		const passwordHash = await this.encryptionProvider.hash(password);

		await this.usersRepository.update({ id, name, surname, password: passwordHash, email });
	}
}
