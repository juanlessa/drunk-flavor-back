import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { UserToken } from '../../entities/userToken.entity';
import { IUsersTokensRepository } from '../IUsersTokens.repository';
import { CreateUserToken, UpdateUserToken } from '../../dtos/userToken.dtos';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';

export class UsersTokensRepositoryInMemory implements IUsersTokensRepository {
	collection: UserToken[] = [];

	async create({ token, type, user_id }: CreateUserToken): Promise<UserToken> {
		const record: UserToken = {
			_id: new ObjectId(),
			token,
			type,
			user_id,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateUserToken): Promise<UserToken> {
		const recordIndex = this.collection.findIndex((u) => u._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('token not found', {
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
			throw new NotFoundError('token not found', {
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

	async findById(id: string): Promise<UserToken | null> {
		const recordFound = this.collection.find((rec) => rec._id.toString() === id);
		return recordFound || null;
	}

	async findAll(): Promise<UserToken[]> {
		const results = [...this.collection];
		return results;
	}
}
