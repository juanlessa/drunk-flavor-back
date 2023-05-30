import { IUserToken } from "@modules/accounts/dtos/UsersTokensDTO";

interface IUsersTokensRepository {
    create({user_id, expires_date, refresh_token }: IUserToken): Promise<IUserToken>;
    findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<IUserToken>;
    //deleteById(id: string): Promise<void>;
    //findByRefreshToken(refresh_token: string): Promise<IUserToken>;
}

export { IUsersTokensRepository };