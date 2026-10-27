import { NotFoundError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { TOKEN_UNIQUE_INDEX, TOKEN_USER_TYPE_UNIQUE_INDEX, TokenModel } from '../entities/token.model';
import { CreateToken, FindByUserIdAndType, UpdateToken } from '@/core/accounts/dtos/token.dtos';
import { Token } from '@/core/accounts/entities/token.entity';
import { TokenHashAlreadyExistsError, TokenUserTypeAlreadyExistsError } from '@/core/accounts/errors/token.errors';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';

export class TokensRepository implements ITokensRepository {
	private model = TokenModel;

	async create(data: CreateToken): Promise<Token> {
		try {
			return await this.model.create(data);
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
		let record: Token | null;
		try {
			record = await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).exec();
		} catch (error) {
			if (isDuplicateKeyError(error, [TOKEN_UNIQUE_INDEX])) {
				throw new TokenHashAlreadyExistsError({ path: 'Tokens.repository' });
			}
			if (isDuplicateKeyError(error, [TOKEN_USER_TYPE_UNIQUE_INDEX])) {
				throw new TokenUserTypeAlreadyExistsError({ path: 'Tokens.repository' });
			}
			throw error;
		}
		if (!record) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'Tokens.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return record;
	}

	async delete(id: string): Promise<Token> {
		const record = await this.model.findByIdAndDelete<Token>(id).exec();
		if (!record) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'Tokens.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return record;
	}

	async deleteByUserId(user_id: string): Promise<number> {
		const result = await this.model.deleteMany({ user_id }).exec();
		return result.deletedCount;
	}

	async findById(id: string): Promise<Token | null> {
		return this.model.findById<Token>(id).lean<Token>({ transform: removeLeanVersionKey }).exec();
	}

	async findByTokenHash(tokenHash: string): Promise<Token | null> {
		return this.model
			.findOne<Token>({ token_hash: tokenHash })
			.lean<Token>({ transform: removeLeanVersionKey })
			.exec();
	}

	async findByUserIdAndType({ user_id, type }: FindByUserIdAndType): Promise<Token | null> {
		return this.model.findOne<Token>({ user_id, type }).lean<Token>({ transform: removeLeanVersionKey }).exec();
	}

	async findByUserId(user_id: string): Promise<Token[]> {
		return this.model.find<Token>({ user_id }).lean<Token[]>({ transform: removeLeanVersionKey }).exec();
	}
}
