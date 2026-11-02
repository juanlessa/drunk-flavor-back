import { NotFoundError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import {
	TOKEN_UNIQUE_INDEX,
	TOKEN_USER_TYPE_UNIQUE_INDEX,
	TokenModel,
	TokenPersistence,
} from '../entities/token.model';
import { TokenMapper } from '../mappers/token.mapper';
import { CreateToken, FindByUserIdAndType, UpdateToken } from '@/core/accounts/dtos/token.dtos';
import { Token } from '@/core/accounts/entities/token.entity';
import { TokenHashAlreadyExistsError, TokenUserTypeAlreadyExistsError } from '@/core/accounts/errors/token.errors';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';

export class TokensRepository implements ITokensRepository {
	private model = TokenModel;

	async create(data: CreateToken): Promise<Token> {
		try {
			const document = await this.model.create(TokenMapper.toPersistence(data));
			return TokenMapper.toDomain(document);
		} catch (error) {
			if (isDuplicateKeyError(error, [TOKEN_UNIQUE_INDEX])) {
				throw new TokenHashAlreadyExistsError({ path: 'Tokens.repository' });
			}
			if (isDuplicateKeyError(error, [TOKEN_USER_TYPE_UNIQUE_INDEX])) {
				throw new TokenUserTypeAlreadyExistsError({ path: 'Tokens.repository' });
			}
			throw error;
		}
	}

	async update({ id, ...data }: UpdateToken): Promise<Token> {
		const objectId = TokenMapper.toObjectId(id);
		if (!objectId) {
			throw this.tokenNotFound('Tokens.repository.update', 'Error on findOneAndUpdate operation');
		}

		let document: TokenPersistence | null;
		try {
			document = await this.model
				.findByIdAndUpdate(objectId, TokenMapper.toPersistence(data), {
					returnDocument: 'after',
					runValidators: true,
				})
				.lean<TokenPersistence>()
				.exec();
		} catch (error) {
			if (isDuplicateKeyError(error, [TOKEN_UNIQUE_INDEX])) {
				throw new TokenHashAlreadyExistsError({ path: 'Tokens.repository' });
			}
			if (isDuplicateKeyError(error, [TOKEN_USER_TYPE_UNIQUE_INDEX])) {
				throw new TokenUserTypeAlreadyExistsError({ path: 'Tokens.repository' });
			}
			throw error;
		}
		if (!document) {
			throw this.tokenNotFound('Tokens.repository.update', 'Error on findOneAndUpdate operation');
		}
		return TokenMapper.toDomain(document);
	}

	async delete(id: string): Promise<Token> {
		const objectId = TokenMapper.toObjectId(id);
		if (!objectId) {
			throw this.tokenNotFound('Tokens.repository.delete', 'Error on findOneAndDelete operation');
		}
		const document = await this.model.findByIdAndDelete(objectId).lean<TokenPersistence>().exec();
		if (!document) {
			throw this.tokenNotFound('Tokens.repository.delete', 'Error on findOneAndDelete operation');
		}
		return TokenMapper.toDomain(document);
	}

	async deleteByUserId(userId: string): Promise<number> {
		const result = await this.model.deleteMany({ user_id: userId }).exec();
		return result.deletedCount;
	}

	async findById(id: string): Promise<Token | null> {
		const objectId = TokenMapper.toObjectId(id);
		if (!objectId) {
			return null;
		}
		const document = await this.model.findById(objectId).lean<TokenPersistence>().exec();
		return document ? TokenMapper.toDomain(document) : null;
	}

	async findByTokenHash(tokenHash: string): Promise<Token | null> {
		const document = await this.model.findOne({ token_hash: tokenHash }).lean<TokenPersistence>().exec();
		return document ? TokenMapper.toDomain(document) : null;
	}

	async findByUserIdAndType({ userId, type }: FindByUserIdAndType): Promise<Token | null> {
		const document = await this.model.findOne({ user_id: userId, type }).lean<TokenPersistence>().exec();
		return document ? TokenMapper.toDomain(document) : null;
	}

	async findByUserId(userId: string): Promise<Token[]> {
		const documents = await this.model.find({ user_id: userId }).lean<TokenPersistence[]>().exec();
		return documents.map((document) => TokenMapper.toDomain(document));
	}

	private tokenNotFound(path: string, cause: string): NotFoundError {
		return new NotFoundError('apiResponses.auth.tokenNotFound', { path, cause });
	}
}
