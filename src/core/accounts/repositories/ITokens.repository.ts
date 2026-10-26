import { Token } from '@/core/accounts/entities/token.entity';
import { CreateToken, FindByUserIdAndType, UpdateToken } from '../dtos/token.dtos';

export interface ITokensRepository {
	create(data: CreateToken): Promise<Token>;
	update(data: UpdateToken): Promise<Token>;
	delete(id: string): Promise<Token>;
	deleteByUserId(user_id: string): Promise<number>;
	findById(id: string): Promise<Token | null>;
	findByTokenHash(tokenHash: string): Promise<Token | null>;
	findByUserIdAndType(data: FindByUserIdAndType): Promise<Token | null>;
	findByUserId(user_id: string): Promise<Token[]>;
}
