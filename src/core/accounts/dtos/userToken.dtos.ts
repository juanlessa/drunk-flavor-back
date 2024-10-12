import { TokenType } from '../entities/userToken.entity';

export type CreateUserToken = {
	token: string;
	user_id: string;
	type: TokenType;
};

export type UpdateUserToken = { id: string } & Partial<{
	token: string;
	user_id: string;
	type: TokenType;
}>;

export type FindByUserIdAndType = {
	user_id: string;
	type: TokenType;
};
