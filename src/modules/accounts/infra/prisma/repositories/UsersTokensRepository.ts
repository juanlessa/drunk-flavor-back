import { ICreateUserToken } from '@modules/accounts/dtos/UsersTokens';
import UserToken from '@modules/accounts/entities/UserToken';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@shared/infra/prisma';

class UsersTokensRepository implements IUsersTokensRepository {
	private prismaClient: PrismaClient;

	constructor() {
		this.prismaClient = getPrismaClient();
	}

	async create({ user_id, expires_date, refresh_token }: ICreateUserToken): Promise<UserToken> {
		const userToken = await this.prismaClient.userToken.create({
			data: {
				user_id,
				expires_date,
				refresh_token
			}
		});
		return userToken;
	}
	async findByUserIdAndRefreshToken(user_id: string, refresh_token: string): Promise<UserToken> {
		const userToken = await this.prismaClient.userToken.findUnique({
			where: { refresh_token }
		});
		if (userToken && userToken.user_id === user_id) {
			return userToken;
		}
		return null as UserToken;
	}
}

export { UsersTokensRepository };
