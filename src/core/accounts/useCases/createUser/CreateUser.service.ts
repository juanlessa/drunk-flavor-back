import { CreateUser } from '@/core/accounts/dtos/user.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';

export class CreateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ name, surname, email, password, role }: CreateUser) {
		const userAlreadyExists = await this.usersRepository.findByEmail(email);
		if (userAlreadyExists) {
			throw new BadRequestError('apiResponses.users.alreadyExist', {
				path: 'CreateUser.service',
			});
		}

		const passwordHash = await this.hashProvider.hash(password);

		const user = await this.usersRepository.create({
			name,
			password: passwordHash,
			surname,
			email,
			role,
		});

		return user;
	}
}
