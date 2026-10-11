import { TokenType } from '../entities/userToken.entity';

export type CreateUserToken = {
	token: string;
	user_id: string;
	type: TokenType;
	expires_at: Date;
};

export type UpdateUserToken = { id: string } & Partial<{
	token: string;
	user_id: string;
	type: TokenType;
	expires_at: Date;
}>;

export type FindByUserIdAndType = {
	user_id: string;
	type: TokenType;
};
