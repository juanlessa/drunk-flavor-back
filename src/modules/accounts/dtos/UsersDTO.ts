interface IUser {
	id?: string;
	name: string;
	email: string;
	password: string;
}

interface IUserProfileResponse {
	id?: string;
	name: string;
	email: string;
}

export { IUser, IUserProfileResponse };
