import { User } from '@/core/accounts/entities/user.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { FindUserById } from './findUserById.dtos';

export class FindUserByIdService {
	constructor(private usersRepository: IUsersRepository) {}

	execute({ userId }: FindUserById): Promise<User | null> {
		return this.usersRepository.findById(userId);
	}
}
