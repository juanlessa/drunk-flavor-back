import { Token, TokenType } from '../entities/token.entity';

export type CreateToken = Pick<Token, 'tokenHash' | 'userId' | 'type' | 'expiresAt'>;

export type UpdateToken = Pick<Token, 'id' | 'tokenHash' | 'userId' | 'type' | 'expiresAt'>;

export type FindByUserIdAndType = Pick<Token, 'userId' | 'type'>;
