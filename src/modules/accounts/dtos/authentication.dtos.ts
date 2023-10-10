export type IAuthenticateUser = {
	email: string;
	password: string;
};

export type IAuthenticateUserResponse = {
	user: {
		name: string;
		email: string;
	};
	token: {
		token: string;
		expires: Date;
	};
	refresh_token: {
		token: string;
		expires: Date;
	};
};
