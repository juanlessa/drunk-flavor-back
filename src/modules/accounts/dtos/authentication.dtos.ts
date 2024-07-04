export type IAuthenticateUser = {
	email: string;
	password: string;
};

export type IAuthenticateUserResponse = {
	user: {
		id: string;
	};
};
