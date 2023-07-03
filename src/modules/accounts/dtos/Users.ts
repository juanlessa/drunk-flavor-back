interface ICreateUser {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: string;
}

interface IUpdateUser {
	id: string;
	name: string;
	surname: string;
	email: string;
	password: string;
	role?: string;
}

interface IDeleteUser {
	id: string;
}
interface IProfileUser {
	id: string;
}
interface IUpdateUserRole {
	userId: string;
	role: string;
}

interface IUserProfileResponse {
	id: string;
	name: string;
	surname: string;
	email: string;
	role: string;
}

interface IAuthenticateUser {
	email: string;
	password: string;
}

interface IAuthenticateUserResponse {
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
}

export {
	ICreateUser,
	IProfileUser,
	IUpdateUserRole,
	IUpdateUser,
	IDeleteUser,
	IUserProfileResponse,
	IAuthenticateUser,
	IAuthenticateUserResponse
};
