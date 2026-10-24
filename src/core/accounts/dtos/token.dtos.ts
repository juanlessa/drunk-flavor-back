import { TokenType } from '../entities/token.entity';

export type CreateToken = {
	token: string;
	user_id: string;
	type: TokenType;
	expires_at: Date;
};

export type UpdateToken = { id: string } & Partial<{
	token: string;
	user_id: string;
	type: TokenType;
	expires_at: Date;
}>;

export type FindByUserIdAndType = {
	user_id: string;
	type: TokenType;
};
