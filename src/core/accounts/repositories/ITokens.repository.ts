import { CreateToken, FindByUserIdAndType, UpdateToken } from '@/core/accounts/dtos/token.dtos';
import { Token } from '@/core/accounts/entities/token.entity';

export interface ITokensRepository {
	create(data: CreateToken): Promise<Token>;
	update(data: UpdateToken): Promise<Token>;
	delete(id: string): Promise<Token>;
	deleteByUserId(userId: string): Promise<number>;
	findById(id: string): Promise<Token | null>;
	findByTokenHash(tokenHash: string): Promise<Token | null>;
	findByUserIdAndType(data: FindByUserIdAndType): Promise<Token | null>;
	findByUserId(userId: string): Promise<Token[]>;
}
