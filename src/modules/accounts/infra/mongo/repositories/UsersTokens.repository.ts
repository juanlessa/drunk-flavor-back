import { ICreateUserToken } from '@modules/accounts/dtos/usersTokens.dtos';
import { IUserToken } from '@modules/accounts/entities/userToken.entity';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokens.repository';
import { UserToken } from '@modules/accounts/infra/mongo/entities/userToken.model';

class UsersTokensRepository implements IUsersTokensRepository {
	async create(data: ICreateUserToken): Promise<IUserToken> {
		const user = new UserToken(data);
		await user.save();
		return user;
	}

	async findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<IUserToken> {
		return await UserToken.findOne<IUserToken>({ refresh_token, user_id }).exec();
	}
}

export { UsersTokensRepository };
