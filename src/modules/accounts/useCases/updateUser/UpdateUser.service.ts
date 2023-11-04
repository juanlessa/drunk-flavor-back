import { IUpdateUserDto } from '@modules/accounts/dtos/user.dtos';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryption.provider';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { BadRequestError } from '@shared/errors/error.lib';

class UpdateUserService {
	constructor(private usersRepository: IUsersRepository, private encryptionProvider: IEncryptionProvider) {}

	async execute({ id, name, surname, password, email }: IUpdateUserDto) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError(USER_ERRORS.not_exist, { path: 'UpdateUser.service' });
		}

		const userEmailALreadyInUse = await this.usersRepository.findByEmail(email);
		if (userEmailALreadyInUse && userEmailALreadyInUse._id.toString() !== user._id.toString()) {
			throw new BadRequestError(USER_ERRORS.already_exist, { path: 'UpdateUser.service' });
		}

		const passwordHash = await this.encryptionProvider.hash(password);

		await this.usersRepository.update({ id, name, surname, password: passwordHash, email });
	}
}

export { UpdateUserService };
