import { ICreateUserToken } from '@modules/accounts/dtos/UsersTokens';
import UserToken from '@modules/accounts/entities/UserToken';
import { IUsersTokensRepository } from '../IUsersTokensRepository';
import { ObjectId } from 'bson';

class UsersTokensRepositoryInMemory implements IUsersTokensRepository {
	usersTokens: UserToken[] = [];

	async create({ user_id, expires_date, refresh_token }: ICreateUserToken): Promise<UserToken> {
		const userToken: UserToken = {
			id: new ObjectId().toString(),
			user_id,
			expires_date,
			refresh_token,
			created_at: new Date()
		};

		this.usersTokens.push(userToken);

		return userToken;
	}
	async findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<UserToken> {
		return this.usersTokens.find(
			(userToken) => userToken.user_id === user_id && userToken.refresh_token === refresh_token
		);
	}

	async deleteById(id: string): Promise<void> {
		const userTokenIndex = this.usersTokens.findIndex((userToken) => userToken.id === id);
		if (userTokenIndex != -1) {
			this.usersTokens.splice(userTokenIndex, 1);
		}
	}

	async findByRefreshToken(refresh_token: string): Promise<UserToken> {
		return this.usersTokens.find((userTokens) => userTokens.refresh_token === refresh_token);
	}
}

export { UsersTokensRepositoryInMemory };
