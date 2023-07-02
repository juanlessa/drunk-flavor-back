interface ICreateUserToken {
	user_id: string;
	expires_date: Date;
	refresh_token: string;
}

interface ICreateRefreshToken {
	userEmail: string;
	userId: string;
	secret: string;
	expiresIn: string;
}
interface ICreateToken {
	userId: string;
	secret: string;
	expiresIn: string;
}

interface IVerifyRefreshToken {
	refresh_token: string;
	secret: string;
}
interface IVerifyToken {
	token: string;
	secret: string;
}

interface IPayload {
	sub: string;
	email: string;
}
export { ICreateUserToken, ICreateRefreshToken, ICreateToken, IPayload, IVerifyRefreshToken, IVerifyToken };
