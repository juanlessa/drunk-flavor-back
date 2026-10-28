import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { User } from '@/core/accounts/entities/user.entity';
import { IAccountsModule } from './IAccountsModule';

export class AccountsModule implements IAccountsModule {
	constructor(private usersRepository: IUsersRepository) {}

	findUserById(userId: string): Promise<User | null> {
		return this.usersRepository.findById(userId);
	}
}
