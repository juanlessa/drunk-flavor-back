import { TokenType, UserToken } from '@/core/accounts/entities/userToken.entity';
import { CreateUserToken, FindByUserIdAndType, UpdateUserToken } from '../dtos/userToken.dtos';
import { QueryParams } from '@/shared/types/query.types';

export interface IUserTokensRepository {
	create(data: CreateUserToken): Promise<UserToken>;
	update(data: UpdateUserToken): Promise<UserToken>;
	delete(id: string): Promise<UserToken>;
	deleteByUserId(user_id: string): Promise<number>;
	findById(id: string): Promise<UserToken | null>;
	findByToken(token: string): Promise<UserToken | null>;
	findByUserIdAndType(data: FindByUserIdAndType): Promise<UserToken | null>;
	findByUserId(user_id: string): Promise<UserToken[]>;
}
