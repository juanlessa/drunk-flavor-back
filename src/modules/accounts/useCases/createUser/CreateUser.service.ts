import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryption.provider';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class CreateUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository,
		@inject('EncryptionProvider')
		private encryptionProvider: IEncryptionProvider
	) {}
	async execute({ name, surname, email, password, role }: ICreateUser) {
		const userAlreadyExists = await this.usersRepository.findByEmail(email);
		if (userAlreadyExists) {
			throw new AppError(USER_ERRORS.already_exist);
		}

		const passwordHash = await this.encryptionProvider.hash(password);

		await this.usersRepository.create({ name, password: passwordHash, surname, email, role });
	}
}

export { CreateUserService };
