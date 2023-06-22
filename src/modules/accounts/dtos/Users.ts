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

interface IUserProfileResponse {
	id: string;
	name: string;
	surname: string;
	email: string;
	role: string;
}

export { ICreateUser, IUpdateUser, IDeleteUser, IUserProfileResponse };
