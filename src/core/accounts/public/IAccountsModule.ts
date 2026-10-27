import { User } from '@/core/accounts/entities/user.entity';

export interface IAccountsModule {
	findUserById(userId: string): Promise<User | null>;
}
