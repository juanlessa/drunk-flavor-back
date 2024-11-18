import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ListUsers } from './listUsers.dtos';

export class ListUsersService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ query = {} }: ListUsers) {
		const categories = await this.usersRepository.findAll(query);

		return categories;
	}
}
