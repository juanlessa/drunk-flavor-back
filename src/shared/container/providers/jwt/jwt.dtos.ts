export type ICreateToken = {
	subject: string;
	secret: string;
	expires_in: string;
};

export type ICreateRefreshToken = {
	sign_property: string;
	subject: string;
	secret: string;
	expires_in: string;
};

export type IVerifyRefreshToken = {
	refresh_token: string;
	secret: string;
};

export type IVerifyToken = {
	token: string;
	secret: string;
};

export type IPayload = {
	sub: string;
};
