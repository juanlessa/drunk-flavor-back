import { CreateUser, UpdateUser, UserWithoutPassword } from '@/modules/accounts/dtos/user.dtos';
import { User } from '@/modules/accounts/entities/user.entity';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { UserModel } from '@/modules/accounts/infra/mongo/entities/user.model';
import { NotFoundError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '@/shared/constants/ResponseMessages';

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
