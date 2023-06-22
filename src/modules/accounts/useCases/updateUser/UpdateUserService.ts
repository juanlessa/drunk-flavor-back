import { IUpdateUser } from '@modules/accounts/dtos/Users';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryptionProvider';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const updateUserSchema = z.object({
	id: z.string().length(24, { message: 'Drink does not exist' }),
	name: z
		.string({ required_error: 'Name is required' })
		.trim()
		.toLowerCase()
		.min(1, { message: 'User must have a name' })
		.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`),
	surname: z
		.string({ required_error: 'Surname is required' })
		.trim()
		.toLowerCase()
		.min(1, { message: 'User must have a surname' })
		.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`),
	email: z.string({ required_error: 'Email is required' }).email({ message: 'Email invalid' }),
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, { message: 'Password must have a minimum of 8 characters' })
});

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
			throw new AppError('User does not exist');
		}

		const userEmailALreadyInUse = await this.usersRepository.findByEmail(email);
		if (userEmailALreadyInUse && userEmailALreadyInUse.id !== user.id) {
			throw new AppError('The email is already in use');
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
