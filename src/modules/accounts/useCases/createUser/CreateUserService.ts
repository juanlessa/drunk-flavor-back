import { ICreateUser } from '@modules/accounts/dtos/Users';
import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { createUserSchema } from '@modules/accounts/validations/users';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryptionProvider';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class CreateUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository,
		@inject('BcryptProvider')
		private bcryptProvider: IEncryptionProvider
	) {}
	async execute(data: ICreateUser) {
		const result = createUserSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<ICreateUser>;
			throw new AppError(error.issues[0].message);
		}
		const { name, surname, password, email, role } = result.data;

		const userAlreadyExists = await this.usersRepository.findByEmail(email);

		if (userAlreadyExists) {
			throw new AppError(USER_ERRORS.already_exist);
		}

		const passwordHash = await this.bcryptProvider.hash(password);

		await this.usersRepository.create({
			name,
			password: passwordHash,
			surname,
			email,
			role
		});
	}
}

export { CreateUserService };
