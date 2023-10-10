import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/user.dtos';
import { IUser } from '@modules/accounts/entities/user.entity';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { User } from '../entities/user.model';

class UsersRepository implements IUsersRepository {
	async create(data: ICreateUser): Promise<IUser> {
		const user = new User(data);
		await user.save();
		return user;
	}

	async update({ id, ...data }: IUpdateUser): Promise<IUser> {
		return await User.findByIdAndUpdate<IUser>({ _id: id }, { ...data }).exec();
	}

	async delete(id: string): Promise<IUser> {
		return await User.findOneAndDelete<IUser>({ _id: id }).exec();
	}

	async findById(id: string): Promise<IUser> {
		return await User.findById<IUser>(id).exec();
	}

	async findByEmail(email: string): Promise<IUser> {
		return await User.findOne<IUser>({ email }).exec();
	}

	async findAll(): Promise<IUser[]> {
		return await User.find<IUser>().exec();
	}
}

export { UsersRepository };
