import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { UserToken } from '../../entities/userToken.entity';
import { IUserTokensRepository } from '../IUserTokens.repository';
import { CreateUserToken, FindByUserIdAndType, UpdateUserToken } from '../../dtos/userToken.dtos';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class UserTokensRepositoryInMemory implements IUserTokensRepository {
	collection: UserToken[] = [];

	async create(data: CreateUserToken): Promise<UserToken> {
		const record: UserToken = {
			_id: new ObjectId(),
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateUserToken): Promise<UserToken> {
		const recordIndex = this.collection.findIndex((u) => u._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'UsersTokens.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		let record = this.collection[recordIndex];
		record = deepUpdate(data, record);
		record.updated_at = new Date();

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<UserToken> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'UsersTokens.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}

		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async deleteByUserId(user_id: string): Promise<number> {
		const initialCount = this.collection.length;
		this.collection = this.collection.filter((rec) => rec.user_id !== user_id);
		const deletedCount = initialCount - this.collection.length;
		return deletedCount;
	}

	async findByToken(token: string): Promise<UserToken | null> {
		const recordFound = this.collection.find((rec) => rec.token === token);
		return recordFound || null;
	}

	async findByUserIdAndType({ user_id, type }: FindByUserIdAndType): Promise<UserToken | null> {
		const recordFound = this.collection.find((rec) => rec.user_id === user_id && rec.type === type);
		return recordFound || null;
	}

	async findById(id: string): Promise<UserToken | null> {
		const recordFound = this.collection.find((rec) => rec._id.toString() === id);
		return recordFound || null;
	}

	async findByUserId(user_id: string): Promise<UserToken[]> {
		const recordsFound = this.collection.filter((rec) => rec.user_id === user_id);
		return recordsFound;
	}

	async findAll(query: QueryParams): Promise<UserToken[]> {
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

		return found;
	}
}
