import { IUserProfileResponse } from '@modules/accounts/dtos/Users';
import { UserMap } from '@modules/accounts/mappers/UserMap';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListUsersService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}

	async execute(adminId: string): Promise<IUserProfileResponse[]> {
		const users = await this.usersRepository.findAll();

		const usersWithoutWhoCalled = users.filter((u) => u.id !== adminId);
		const usersResponse = usersWithoutWhoCalled.map((u) => UserMap.toDTO(u));

		return usersResponse;
	}
}

export { ListUsersService };
