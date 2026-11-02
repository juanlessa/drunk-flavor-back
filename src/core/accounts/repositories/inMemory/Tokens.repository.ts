import { randomUUID } from 'node:crypto';
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
		if (this.collection.some((record) => record.tokenHash === data.tokenHash)) {
			throw new TokenHashAlreadyExistsError({ path: 'TokensRepositoryInMemory.create' });
		}
		if (this.collection.some((record) => record.userId === data.userId && record.type === data.type)) {
			throw new TokenUserTypeAlreadyExistsError({ path: 'TokensRepositoryInMemory.create' });
		}

		const now = new Date();
		const record: Token = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateToken): Promise<Token> {
		const recordIndex = this.collection.findIndex((token) => token.id === id);
		if (recordIndex === -1) {
			throw this.tokenNotFound('Tokens.repository.update', 'Error on findOneAndUpdate operation');
		}

		const record: Token = { ...deepUpdate(data, this.collection[recordIndex]), updatedAt: new Date() };
		if (
			this.collection.some(
				(candidate, index) => index !== recordIndex && candidate.tokenHash === record.tokenHash,
			)
		) {
			throw new TokenHashAlreadyExistsError({ path: 'TokensRepositoryInMemory.update' });
		}
		if (
			this.collection.some(
				(candidate, index) =>
					index !== recordIndex && candidate.userId === record.userId && candidate.type === record.type,
			)
		) {
			throw new TokenUserTypeAlreadyExistsError({ path: 'TokensRepositoryInMemory.update' });
		}

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Token> {
		const recordIndex = this.collection.findIndex((token) => token.id === id);
		if (recordIndex === -1) {
			throw this.tokenNotFound('Tokens.repository.delete', 'Error on findOneAndDelete operation');
		}
		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async deleteByUserId(userId: string): Promise<number> {
		const initialCount = this.collection.length;
		this.collection = this.collection.filter((token) => token.userId !== userId);
		return initialCount - this.collection.length;
	}

	async findByTokenHash(tokenHash: string): Promise<Token | null> {
		return this.collection.find((token) => token.tokenHash === tokenHash) ?? null;
	}

	async findByUserIdAndType({ userId, type }: FindByUserIdAndType): Promise<Token | null> {
		return this.collection.find((token) => token.userId === userId && token.type === type) ?? null;
	}

	async findById(id: string): Promise<Token | null> {
		return this.collection.find((token) => token.id === id) ?? null;
	}

	async findByUserId(userId: string): Promise<Token[]> {
		return this.collection.filter((token) => token.userId === userId);
	}

	async findAll(query: QueryParams): Promise<Token[]> {
		let found = [...this.collection];
		if (query.search) {
			found = filterItemsBySearchCriteria(found, query.search);
		}
		if (query.sort) {
			found = sortItemsByFields(found, query.sort);
		}
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	private tokenNotFound(path: string, cause: string): NotFoundError {
		return new NotFoundError('apiResponses.auth.tokenNotFound', { path, cause });
	}
}
