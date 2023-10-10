import { IUpdateUser } from '@modules/accounts/dtos/user.dtos';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryption.provider';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';

@injectable()
class UpdateUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository,
		@inject('BcryptProvider')
		private bcryptProvider: IEncryptionProvider
	) {}
	async execute({ id, name, surname, password, email }: IUpdateUser) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		const userEmailALreadyInUse = await this.usersRepository.findByEmail(email);
		if (userEmailALreadyInUse && userEmailALreadyInUse._id.toString() !== user._id.toString()) {
			throw new AppError(USER_ERRORS.already_exist);
		}

		const passwordHash = await this.bcryptProvider.hash(password);

		await this.usersRepository.update({ id, name, surname, password: passwordHash, email });
	}
}

export { UpdateUserService };
