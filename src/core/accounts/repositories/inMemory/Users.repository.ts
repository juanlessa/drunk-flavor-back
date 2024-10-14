import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { CreateUser, UpdateUser, UserWithoutPassword } from '@/core/accounts/dtos/user.dtos';
import { ObjectId } from 'mongodb';
import { User } from '@/core/accounts/entities/user.entity';
import { NotFoundError } from '@/shared/error/error.lib';
import { omitUserPassword } from '../../mappers/user.mappers';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { QueryParams } from '@/shared/types/query.types';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class UsersRepositoryInMemory implements IUsersRepository {
	collection: User[] = [];

	async create(data: CreateUser): Promise<User> {
		const record: User = {
			_id: new ObjectId(),
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateUser): Promise<User> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.users.notFound', {
				path: 'Users.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		let record = this.collection[recordIndex];
		record = deepUpdate(data, record);
		record.updated_at = new Date();

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<User> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.users.notFound', {
				path: 'Users.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}

		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findByEmail(email: string): Promise<User | null> {
		const recordFound = this.collection.find((rec) => rec.email === email);
		return recordFound || null;
	}

	async findById(id: string): Promise<User | null> {
		const recordFound = this.collection.find((rec) => rec._id.toString() === id);
		return recordFound || null;
	}

	async findAll(query: QueryParams): Promise<UserWithoutPassword[]> {
		let found = [...this.collection];

		if (query.search) {
			found = filterItemsBySearchCriteria(found, query.search);
		}

		if (query.sort) {
			found = sortItemsByFields(found, query.sort);
		}

		found = paginateItems(
			found,
			query.limit || DEFAULT_QUERY_PARAMS.limit,
			query.page || DEFAULT_QUERY_PARAMS.page,
		);

		return found.map(omitUserPassword);
	}
}
