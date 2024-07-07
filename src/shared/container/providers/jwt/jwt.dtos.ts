export type ICreateToken = {
	subject: string;
	secret: string;
	expires_in: number;
};

export type IVerifyToken = {
	token: string;
	secret: string;
};

export type IPayload = {
	subject: string;
	isExpired: boolean;
};
