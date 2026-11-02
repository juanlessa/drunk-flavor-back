import { CreateUser, UpdateUser } from '@/core/accounts/dtos/user.dtos';
import { User } from '@/core/accounts/entities/user.entity';
import { QueryParams } from '@/shared/types/query.types';
import { Role } from '@/shared/accessControl/roles';

export interface IUsersRepository {
	create(data: CreateUser): Promise<User>;
	update(data: UpdateUser): Promise<User>;
	incrementSessionVersion(id: string): Promise<User>;
	delete(id: string): Promise<User>;
	findById(id: string): Promise<User | null>;
	/** Returns the users matching the given ids; unknown or malformed ids are ignored. */
	findByIds(ids: string[]): Promise<User[]>;
	findByEmail(email: string): Promise<User | null>;
	findByRole(role: Role): Promise<User | null>;
	findAll(query: QueryParams): Promise<User[]>;
}
