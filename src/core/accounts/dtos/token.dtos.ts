import { TokenType } from '../entities/token.entity';

export type CreateToken = {
	tokenHash: string;
	userId: string;
	type: TokenType;
	expiresAt: Date;
};

export type UpdateToken = { id: string } & Partial<{
	tokenHash: string;
	userId: string;
	type: TokenType;
	expiresAt: Date;
}>;

export type FindByUserIdAndType = {
	userId: string;
	type: TokenType;
};
