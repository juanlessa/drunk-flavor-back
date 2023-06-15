import UserToken from '@modules/accounts/entities/UserToken';
import { ICreateUserToken } from '@modules/accounts/dtos/UsersTokens';

interface IUsersTokensRepository {
	create({ user_id, expires_date, refresh_token }: ICreateUserToken): Promise<UserToken>;
	findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<UserToken>;
	//deleteById(id: string): Promise<void>;
	//findByRefreshToken(refresh_token: string): Promise<IUserToken>;
}

export { IUsersTokensRepository };
