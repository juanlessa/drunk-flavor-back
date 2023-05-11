import { PrismaClient } from '@prisma/client'
import { IUsersTokensRepository } from "@modules/accounts/repositories/IUsersTokensRepository";
import { IUserToken } from '@modules/accounts/dtos/UsersTokensDTO';


class UsersTokensRepository implements IUsersTokensRepository {
    private prismaClient: PrismaClient;

    constructor() {
        this.prismaClient =  new PrismaClient();
    }

    async create({ user_id, expires_date,refresh_token }: IUserToken): Promise<IUserToken> {
        const userToken = this.prismaClient.userToken.create({
            data: {
                user_id,
                expires_date,
                refresh_token,
            }
        });
        return userToken;
    }

}


export { UsersTokensRepository };