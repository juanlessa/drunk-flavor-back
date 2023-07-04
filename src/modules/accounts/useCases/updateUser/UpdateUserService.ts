import { IUpdateUser } from '@modules/accounts/dtos/Users';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryptionProvider';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';
import { updateUserSchema } from '@modules/accounts/validations/users';
import { USER_ERRORS } from '@modules/accounts/errors/userErrors';

@injectable()
class UpdateUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository,
		@inject('BcryptProvider')
		private bcryptProvider: IEncryptionProvider
	) {}
	async execute(data: IUpdateUser) {
		const result = updateUserSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateUser>;
			throw new AppError(error.issues[0].message);
		}
		const { id, name, surname, password, email } = result.data;

		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		const userEmailALreadyInUse = await this.usersRepository.findByEmail(email);
		if (userEmailALreadyInUse && userEmailALreadyInUse.id !== user.id) {
			throw new AppError(USER_ERRORS.already_exist);
		}

		const passwordHash = await this.bcryptProvider.hash(password);

		user.name = name;
		user.surname = surname;
		user.email = email;
		user.password = passwordHash;

		await this.usersRepository.update(user);
	}
}

export { UpdateUserService };
