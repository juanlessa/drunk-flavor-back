import { TokenType, UserToken } from '@/core/accounts/entities/userToken.entity';
import { CreateUserToken, FindByUserIdAndType, UpdateUserToken } from '../dtos/userToken.dtos';

export interface IUserTokensRepository {
	create(data: CreateUserToken): Promise<UserToken>;
	update(data: UpdateUserToken): Promise<UserToken>;
	delete(id: string): Promise<UserToken>;
	findById(id: string): Promise<UserToken | null>;
	findByToken(token: string): Promise<UserToken | null>;
	findByUserIdAndType(data: FindByUserIdAndType): Promise<UserToken | null>;
	findAll(): Promise<UserToken[]>;
}
