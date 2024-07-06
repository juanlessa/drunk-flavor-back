import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';

export class ListUsersService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute(adminId: string) {
		const users = await this.usersRepository.findAll();

		return users.filter((u) => u._id.toString() !== adminId);
	}
}
