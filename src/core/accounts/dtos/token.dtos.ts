import { Token, TokenType } from '../entities/token.entity';

export type CreateToken = Pick<Token, 'tokenHash' | 'userId' | 'type' | 'expiresAt'>;

/** Partial update: only the provided fields change, matching both repository implementations. */
export type UpdateToken = Pick<Token, 'id'> & Partial<Pick<Token, 'tokenHash' | 'userId' | 'type' | 'expiresAt'>>;

export type FindByUserIdAndType = Pick<Token, 'userId' | 'type'>;
