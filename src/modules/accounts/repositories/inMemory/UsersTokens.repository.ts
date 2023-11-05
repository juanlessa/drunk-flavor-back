import { ICreateUserToken } from '@modules/accounts/dtos/usersTokens.dtos';
import { IUserToken } from '@modules/accounts/entities/userToken.entity';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
import { NotFoundError } from '@shared/errors/error.lib';
import { ObjectId } from 'bson';

class UsersTokensRepositoryInMemory implements IUsersTokensRepository {
	usersTokens: IUserToken[] = [];

	async create({ user_id, expires_date, refresh_token }: ICreateUserToken): Promise<IUserToken> {
		const userToken: IUserToken = {
			_id: new ObjectId().toString(),
			user_id,
			expires_date,
			refresh_token,
			created_at: new Date(),
			updated_at: new Date()
		};
		this.usersTokens.push(userToken);
		return userToken;
	}

	async delete(id: string): Promise<IUserToken> {
		const userTokenIndex = this.usersTokens.findIndex((uToken) => uToken._id === id);
		if (userTokenIndex === -1) {
			throw new NotFoundError(AUTHENTICATION_ERRORS.invalid_refresh_token, {
				path: 'UsersTokens.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		const [deletedUserToken] = this.usersTokens.splice(userTokenIndex, 1);
		return deletedUserToken;
	}

	async findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<IUserToken | null> {
		const userToken = this.usersTokens.find(
			(userToken) => userToken.user_id === user_id && userToken.refresh_token === refresh_token
		);

		return userToken || null;
	}
}

export { UsersTokensRepositoryInMemory };
