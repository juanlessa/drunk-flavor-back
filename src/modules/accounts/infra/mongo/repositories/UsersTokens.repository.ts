import { ICreateUserToken } from '@modules/accounts/dtos/usersTokens.dtos';
import { IUserToken } from '@modules/accounts/entities/userToken.entity';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
import { UserToken } from '@modules/accounts/infra/mongo/entities/userToken.model';
import { NotFoundError } from '@shared/errors/error.lib';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';

class UsersTokensRepository implements IUsersTokensRepository {
	async create(data: ICreateUserToken): Promise<IUserToken> {
		return UserToken.create(data);
	}

	async delete(id: string): Promise<IUserToken> {
		const userToken = await UserToken.findByIdAndDelete<IUserToken>(id).exec();
		if (!userToken) {
			throw new NotFoundError(AUTHENTICATION_ERRORS.invalid_refresh_token, {
				path: 'UsersTokens.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		return userToken;
	}

	async findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<IUserToken | null> {
		return UserToken.findOne<IUserToken>({ refresh_token, user_id }).exec();
	}
}

export { UsersTokensRepository };
