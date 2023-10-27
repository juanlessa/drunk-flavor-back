import { ICreateUserToken } from '@modules/accounts/dtos/usersTokens.dtos';
import { IUserToken } from '@modules/accounts/entities/userToken.entity';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
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
	async findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<IUserToken> {
		return this.usersTokens.find(
			(userToken) => userToken.user_id === user_id && userToken.refresh_token === refresh_token
		);
	}

	async deleteById(id: string): Promise<IUserToken> {
		let userToken: IUserToken;
		const userTokenIndex = this.usersTokens.findIndex((uToken) => uToken._id === id);
		if (userTokenIndex != -1) {
			const deleted = this.usersTokens.splice(userTokenIndex, 1);
			userToken = deleted[0];
		}
		return userToken;
	}

	async findByRefreshToken(refresh_token: string): Promise<IUserToken> {
		return this.usersTokens.find((userTokens) => userTokens.refresh_token === refresh_token);
	}
}

export { UsersTokensRepositoryInMemory };
