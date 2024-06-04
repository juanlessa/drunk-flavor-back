export type IAuthenticateUser = {
	email: string;
	password: string;
};

export type IAuthenticateUserResponse = {
	user: {
		name: string;
		surname: string;
		email: string;
	};
	accessToken: string;
	refreshToken: string;
};
