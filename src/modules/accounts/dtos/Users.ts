interface ICreateUser {
	name: string;
	surname: string;
	email: string;
	password: string;
}

interface IUpdateUser {
	id: string;
	name: string;
	surname: string;
	email: string;
	password: string;
}

interface IUserProfileResponse {
	id: string;
	name: string;
	surname: string;
	email: string;
}

export { ICreateUser, IUpdateUser, IUserProfileResponse };
