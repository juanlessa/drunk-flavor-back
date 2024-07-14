import { CreateUser, UpdateUser, UserWithoutPassword } from '@/core/accounts/dtos/user.dtos';
import { User } from '@/core/accounts/entities/user.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { NotFoundError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '@/core/accounts/constants/users.constants';

export class UsersRepository implements IUsersRepository {
	async create(data: CreateUser): Promise<User> {
		return UserModel.create(data);
	}

	async update({ id, ...data }: UpdateUser): Promise<User> {
		const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
		if (!user) {
			throw new NotFoundError(USER_MESSAGES.notFound.message, {
				path: 'Users.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return user;
	}

	async delete(id: string): Promise<User> {
		const user = await UserModel.findByIdAndDelete<User>(id).exec();
		if (!user) {
			throw new NotFoundError(USER_MESSAGES.notFound.message, {
				path: 'Users.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return user;
	}

	async findById(id: string): Promise<User | null> {
		return UserModel.findById<User>(id).exec();
	}

	async findByEmail(email: string): Promise<User | null> {
		return UserModel.findOne<User>({ email }).exec();
	}

	async findAll(): Promise<UserWithoutPassword[]> {
		return UserModel.find<UserWithoutPassword>().select('-password').exec();
	}
}
