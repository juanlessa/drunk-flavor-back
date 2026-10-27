import { CreateUser, UpdateUser } from '@/core/accounts/dtos/user.dtos';
import { User } from '@/core/accounts/entities/user.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { USER_EMAIL_UNIQUE_INDEX, UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { NotFoundError } from '@/shared/error/error.lib';
import { UserEmailAlreadyExistsError } from '@/core/accounts/errors/user.errors';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

export class UsersRepository implements IUsersRepository {
	async create(data: CreateUser): Promise<User> {
		try {
			return await UserModel.create(data);
		} catch (error) {
			if (isDuplicateKeyError(error, [USER_EMAIL_UNIQUE_INDEX])) {
				throw new UserEmailAlreadyExistsError({ path: 'Users.repository' });
			}
			throw error;
		}
	}

	async update({ id, ...data }: UpdateUser): Promise<User> {
		let user: User | null;
		try {
			user = await UserModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).exec();
		} catch (error) {
			if (isDuplicateKeyError(error, [USER_EMAIL_UNIQUE_INDEX])) {
				throw new UserEmailAlreadyExistsError({ path: 'Users.repository' });
			}
			throw error;
		}
		if (!user) {
			throw new NotFoundError('apiResponses.users.notFound', {
				path: 'Users.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return user;
	}

	async delete(id: string): Promise<User> {
		const user = await UserModel.findByIdAndDelete<User>(id).exec();
		if (!user) {
			throw new NotFoundError('apiResponses.users.notFound', {
				path: 'Users.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return user;
	}

	async findById(id: string): Promise<User | null> {
		return UserModel.findById(id).lean<User>({ transform: removeLeanVersionKey }).exec();
	}

	async findByEmail(email: string): Promise<User | null> {
		return UserModel.findOne<User>({ email }).exec();
	}

	async findAll(query: QueryParams): Promise<User[]> {
		return buildQuery(query, UserModel).lean<User[]>({ transform: removeLeanVersionKey }).exec();
	}
}
