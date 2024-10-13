import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { CreateUserDTO } from './createUser.dtos';
import { UserStatusEnum } from '../../entities/user.entity';

export class CreateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ name, surname, email, password, role }: CreateUserDTO) {
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
			status: UserStatusEnum['pending'],
		});

		return user;
	}
}
