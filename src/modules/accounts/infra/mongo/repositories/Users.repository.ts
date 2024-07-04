import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/user.dtos';
import { IUser } from '@modules/accounts/entities/user.entity';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { User } from '@modules/accounts/infra/mongo/entities/user.model';
import { NotFoundError } from '@shared/errors/error.lib';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';

class UsersRepository implements IUsersRepository {
	async create(data: ICreateUser): Promise<IUser> {
		return User.create(data);
	}

	async update({ id, ...data }: IUpdateUser): Promise<IUser> {
		const user = await User.findByIdAndUpdate(id, data, { new: true }).exec();
		if (!user) {
			throw new NotFoundError(USER_ERRORS.not_found, {
				path: 'Users.repository',
				cause: 'Error on findOneAndUpdate operation'
			});
		}
		return user;
	}

	async delete(id: string): Promise<IUser> {
		const user = await User.findByIdAndDelete<IUser>(id).exec();
		if (!user) {
			throw new NotFoundError(USER_ERRORS.not_found, {
				path: 'Users.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		return user;
	}

	async findById(id: string): Promise<IUser | null> {
		return User.findById<IUser>(id).exec();
	}

	async findByEmail(email: string): Promise<IUser | null> {
		return User.findOne<IUser>({ email }).exec();
	}

	async findAll(): Promise<IUser[]> {
		return User.find<IUser>().exec();
	}
}

export { UsersRepository };
