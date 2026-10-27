import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { Token } from '../../entities/token.entity';
import { TokenHashAlreadyExistsError, TokenUserTypeAlreadyExistsError } from '../../errors/token.errors';
import { ITokensRepository } from '../ITokens.repository';
import { CreateToken, FindByUserIdAndType, UpdateToken } from '../../dtos/token.dtos';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class TokensRepositoryInMemory implements ITokensRepository {
	collection: Token[] = [];

	async create(data: CreateToken): Promise<Token> {
		if (this.collection.some((record) => record.token_hash === data.token_hash)) {
			throw new TokenHashAlreadyExistsError({ path: 'TokensRepositoryInMemory.create' });
		}
		if (this.collection.some((record) => record.user_id === data.user_id && record.type === data.type)) {
			throw new TokenUserTypeAlreadyExistsError({ path: 'TokensRepositoryInMemory.create' });
		}

		const record: Token = {
			_id: new ObjectId(),
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateToken): Promise<Token> {
		const recordIndex = this.collection.findIndex((u) => u._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'Tokens.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		let record = this.collection[recordIndex];
		record = deepUpdate(data, record);
		if (
			this.collection.some(
				(candidate, index) => index !== recordIndex && candidate.token_hash === record.token_hash,
			)
		) {
			throw new TokenHashAlreadyExistsError({ path: 'TokensRepositoryInMemory.update' });
		}
		if (
			this.collection.some(
				(candidate, index) =>
					index !== recordIndex && candidate.user_id === record.user_id && candidate.type === record.type,
			)
		) {
			throw new TokenUserTypeAlreadyExistsError({ path: 'TokensRepositoryInMemory.update' });
		}
		record.updated_at = new Date();

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Token> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'Tokens.repository.delete',
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

	async findByTokenHash(tokenHash: string): Promise<Token | null> {
		const recordFound = this.collection.find((rec) => rec.token_hash === tokenHash);
		return recordFound || null;
	}

	async findByUserIdAndType({ user_id, type }: FindByUserIdAndType): Promise<Token | null> {
		const recordFound = this.collection.find((rec) => rec.user_id === user_id && rec.type === type);
		return recordFound || null;
	}

	async findById(id: string): Promise<Token | null> {
		const recordFound = this.collection.find((rec) => rec._id.toString() === id);
		return recordFound || null;
	}

	async findByUserId(user_id: string): Promise<Token[]> {
		const recordsFound = this.collection.filter((rec) => rec.user_id === user_id);
		return recordsFound;
	}

	async findAll(query: QueryParams): Promise<Token[]> {
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
