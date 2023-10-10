export type ICreateUserToken = {
	user_id: string;
	expires_date: Date;
	refresh_token: string;
};

export type IRefreshUserToken = {
	token: string;
};

export type IRefreshTokenResponse = {
	token: string;
	expires: Date;
};
