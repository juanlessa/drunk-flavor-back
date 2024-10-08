import { NotFoundError } from '@/shared/error/error.lib';
import { IUsersTokensRepository } from '@/core/accounts/repositories/IUsersTokens.repository';
import { UserTokenModel } from '../entities/userToken.model';
import { CreateUserToken, UpdateUserToken } from '@/core/accounts/dtos/userToken.dtos';
import { UserToken } from '@/core/accounts/entities/userToken.entity';

export class UsersTokensRepository implements IUsersTokensRepository {
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

	async findAll(): Promise<UserToken[]> {
		return this.model.find<UserToken>().exec();
	}
}
