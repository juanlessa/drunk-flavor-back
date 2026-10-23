import { NotFoundError } from '@/shared/error/error.lib';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { USER_TOKEN_UNIQUE_INDEXES, UserTokenModel } from '../entities/userToken.model';
import { CreateUserToken, FindByUserIdAndType, UpdateUserToken } from '@/core/accounts/dtos/userToken.dtos';
import { UserToken } from '@/core/accounts/entities/userToken.entity';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';

export class UserTokensRepository implements IUserTokensRepository {
	private model = UserTokenModel;

	async create(data: CreateUserToken): Promise<UserToken> {
		try {
			return await this.model.create(data);
		} catch (error) {
			throw mapDuplicateKeyError(error, USER_TOKEN_UNIQUE_INDEXES, 'apiResponses.auth.tokenAlreadyExist', {
				path: 'UserTokens.repository',
			});
		}
	}

	async update({ id, ...data }: UpdateUserToken): Promise<UserToken> {
		let record: UserToken | null;
		try {
			record = await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).exec();
		} catch (error) {
			throw mapDuplicateKeyError(error, USER_TOKEN_UNIQUE_INDEXES, 'apiResponses.auth.tokenAlreadyExist', {
				path: 'UserTokens.repository',
			});
		}
		if (!record) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'UsersTokens.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return record;
	}

	async delete(id: string): Promise<UserToken> {
		const record = await this.model.findByIdAndDelete<UserToken>(id).exec();
		if (!record) {
			throw new NotFoundError('apiResponses.auth.tokenNotFound', {
				path: 'UsersTokens.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return record;
	}

	async deleteByUserId(user_id: string): Promise<number> {
		const result = await this.model.deleteMany({ user_id }).exec();
		return result.deletedCount;
	}

	async findById(id: string): Promise<UserToken | null> {
		return this.model.findById<UserToken>(id).lean<UserToken>({ transform: removeLeanVersionKey }).exec();
	}

	async findByToken(token: string): Promise<UserToken | null> {
		return this.model.findOne<UserToken>({ token }).lean<UserToken>({ transform: removeLeanVersionKey }).exec();
	}

	async findByUserIdAndType({ user_id, type }: FindByUserIdAndType): Promise<UserToken | null> {
		return this.model
			.findOne<UserToken>({ user_id, type })
			.lean<UserToken>({ transform: removeLeanVersionKey })
			.exec();
	}

	async findByUserId(user_id: string): Promise<UserToken[]> {
		return this.model.find<UserToken>({ user_id }).lean<UserToken[]>({ transform: removeLeanVersionKey }).exec();
	}
}
