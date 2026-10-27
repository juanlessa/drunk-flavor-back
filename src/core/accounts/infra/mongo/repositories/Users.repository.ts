import { CreateUser, UpdateUser } from '@/core/accounts/dtos/user.dtos';
import { User } from '@/core/accounts/entities/user.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { USER_EMAIL_UNIQUE_INDEX, UserModel, UserPersistence } from '@/core/accounts/infra/mongo/entities/user.model';
import { UserMapper } from '@/core/accounts/infra/mongo/mappers/user.mapper';
import { NotFoundError } from '@/shared/error/error.lib';
import { UserEmailAlreadyExistsError } from '@/core/accounts/errors/user.errors';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

export class UsersRepository implements IUsersRepository {
	async create(data: CreateUser): Promise<User> {
		try {
			const document = await UserModel.create(UserMapper.toPersistence(data));
			return UserMapper.toDomain(document);
		} catch (error) {
			if (isDuplicateKeyError(error, [USER_EMAIL_UNIQUE_INDEX])) {
				throw new UserEmailAlreadyExistsError({ path: 'Users.repository' });
			}
			throw error;
		}
	}

	async update({ id, ...data }: UpdateUser): Promise<User> {
		const objectId = UserMapper.toObjectId(id);
		if (!objectId) {
			throw this.userNotFound('Users.repository.update', 'Error on findOneAndUpdate operation');
		}

		let document: UserPersistence | null;
		try {
			document = await UserModel.findByIdAndUpdate(objectId, UserMapper.toPersistence(data), {
				returnDocument: 'after',
				runValidators: true,
			})
				.lean<UserPersistence>()
				.exec();
		} catch (error) {
			if (isDuplicateKeyError(error, [USER_EMAIL_UNIQUE_INDEX])) {
				throw new UserEmailAlreadyExistsError({ path: 'Users.repository' });
			}
			throw error;
		}
		if (!document) {
			throw this.userNotFound('Users.repository.update', 'Error on findOneAndUpdate operation');
		}
		return UserMapper.toDomain(document);
	}

	async delete(id: string): Promise<User> {
		const objectId = UserMapper.toObjectId(id);
		if (!objectId) {
			throw this.userNotFound('Users.repository.delete', 'Error on findOneAndDelete operation');
		}

		const document = await UserModel.findByIdAndDelete(objectId).lean<UserPersistence>().exec();
		if (!document) {
			throw this.userNotFound('Users.repository.delete', 'Error on findOneAndDelete operation');
		}
		return UserMapper.toDomain(document);
	}

	async findById(id: string): Promise<User | null> {
		const objectId = UserMapper.toObjectId(id);
		if (!objectId) {
			return null;
		}

		const document = await UserModel.findById(objectId).lean<UserPersistence>().exec();
		return document ? UserMapper.toDomain(document) : null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const document = await UserModel.findOne({ email }).lean<UserPersistence>().exec();
		return document ? UserMapper.toDomain(document) : null;
	}

	async findAll(query: QueryParams): Promise<User[]> {
		const documents = await buildQuery<UserPersistence>(UserMapper.toPersistenceQuery(query), UserModel)
			.lean<UserPersistence[]>()
			.exec();
		return documents.map((document) => UserMapper.toDomain(document));
	}

	private userNotFound(path: string, cause: string): NotFoundError {
		return new NotFoundError('apiResponses.users.notFound', { path, cause });
	}
}
