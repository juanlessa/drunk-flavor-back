import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { UserToken } from '../../entities/userToken.entity';
import { IUserTokensRepository } from '../IUserTokens.repository';
import { CreateUserToken, FindByUserIdAndType, UpdateUserToken } from '../../dtos/userToken.dtos';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';

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

	async findAll(): Promise<UserToken[]> {
		const results = [...this.collection];
		return results;
	}
}
