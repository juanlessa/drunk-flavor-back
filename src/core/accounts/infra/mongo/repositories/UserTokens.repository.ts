import { NotFoundError } from '@/shared/error/error.lib';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { UserTokenModel } from '../entities/userToken.model';
import { CreateUserToken, FindByUserIdAndType, UpdateUserToken } from '@/core/accounts/dtos/userToken.dtos';
import { TokenType, UserToken } from '@/core/accounts/entities/userToken.entity';

export class UserTokensRepository implements IUserTokensRepository {
	private model = UserTokenModel;

	async create(data: CreateUserToken): Promise<UserToken> {
		return this.model.create(data);
	}

	async update({ id, ...data }: UpdateUserToken): Promise<UserToken> {
		const record = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
		if (!record) {
			throw new NotFoundError('token not found', {
				path: 'UsersTokens.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return record;
	}

	async delete(id: string): Promise<UserToken> {
		const record = await this.model.findByIdAndDelete<UserToken>(id).exec();
		if (!record) {
			throw new NotFoundError('token not found', {
				path: 'UsersTokens.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return record;
	}

	async findById(id: string): Promise<UserToken | null> {
		return this.model.findById<UserToken>(id).exec();
	}

	async findByToken(token: string): Promise<UserToken | null> {
		return this.model.findOne<UserToken>({ token }).exec();
	}

	async findByUserIdAndType({ user_id, type }: FindByUserIdAndType): Promise<UserToken | null> {
		return this.model.findOne<UserToken>({ user_id, type }).exec();
	}

	async findAll(): Promise<UserToken[]> {
		return this.model.find<UserToken>().exec();
	}
}