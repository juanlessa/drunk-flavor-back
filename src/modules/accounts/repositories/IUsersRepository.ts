import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/Users';
import User from '../entities/User';

interface IUsersRepository {
	create(data: ICreateUser): Promise<User>;
	update(data: IUpdateUser): Promise<User>;
	findById(id: string): Promise<User>;
	findByEmail(email: string): Promise<User>;
	findAll(): Promise<User[]>;
	delete(id: string): Promise<User>;
}

export { IUsersRepository };
