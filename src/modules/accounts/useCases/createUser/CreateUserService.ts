import { ICreateUser } from '@modules/accounts/dtos/Users';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IEncryptionProvider } from '@shared/container/providers/encryption/IEncryptionProvider';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const createUserSchema = z.object({
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
		.min(8, { message: 'Password must have a minimum of 8 characters' }),
	role: z
		.string({ required_error: 'Role is required' })
		.trim()
		.toLowerCase()
		.min(1, { message: 'User must have a role' })
});

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
			throw new AppError('User already exists');
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
