import { IUserProfileResponse } from '@modules/accounts/dtos/user.dtos';
import { mapToUserDto } from '@modules/accounts/mappers/user.mapper';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListUsersService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}

	async execute(adminId: string): Promise<IUserProfileResponse[]> {
		const users = await this.usersRepository.findAll();

		const usersWithoutWhoCalled = users.filter((u) => u._id.toString() !== adminId);
		const usersResponse = usersWithoutWhoCalled.map((u) => mapToUserDto(u));

		return usersResponse;
	}
}

export { ListUsersService };
