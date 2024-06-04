export type ICreateToken = {
	subject: string;
	secret: string;
	expires_in: number;
};

export type ICreateRefreshToken = {
	sign_property: string;
	subject: string;
	secret: string;
	expires_in: number;
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
	subject: string;
	isExpired: boolean;
};
