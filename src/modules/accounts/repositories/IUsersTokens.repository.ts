import { IUserToken } from '@modules/accounts/entities/userToken.entity';
import { ICreateUserToken } from '@modules/accounts/dtos/usersTokens.dtos';

interface IUsersTokensRepository {
	create({ user_id, expires_date, refresh_token }: ICreateUserToken): Promise<IUserToken>;
	delete(id: string): Promise<IUserToken>;
	findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<IUserToken | null>;
}

export { IUsersTokensRepository };
