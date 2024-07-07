export const USER_MESSAGES = {
	notExist: {
		message: 'User does not exist',
		i18nKey: 'apiResponses.users.notExist',
	},
	alreadyExist: {
		message: 'User already exists',
		i18nKey: 'apiResponses.users.alreadyExist',
	},
	notFound: {
		message: 'User not found',
		i18nKey: 'apiResponses.users.notFound',
	},
	requiredId: {
		message: 'ID is required',
		i18nKey: 'apiResponses.users.requiredId',
	},
	invalidIdFormat: {
		message: 'Invalid ID format',
		i18nKey: 'apiResponses.users.invalidIdFormat',
	},
	requiredName: {
		message: 'Name is required',
		i18nKey: 'apiResponses.users.requiredName',
	},
	invalidNameFormat: {
		message: 'Name must have a minimum of 1 character',
		i18nKey: 'apiResponses.users.invalidNameFormat',
	},
	requiredSurname: {
		message: 'Surname is required',
		i18nKey: 'apiResponses.users.requiredSurname',
	},
	invalidSurnameFormat: {
		message: 'Surname must have a minimum of 1 character',
		i18nKey: 'apiResponses.users.invalidSurnameFormat',
	},
	requiredEmail: {
		message: 'Email is required',
		i18nKey: 'apiResponses.users.requiredEmail',
	},
	invalidEmailFormat: {
		message: 'Invalid email format',
		i18nKey: 'apiResponses.users.invalidEmailFormat',
	},
	requiredPassword: {
		message: 'Password is required',
		i18nKey: 'apiResponses.users.requiredPassword',
	},
	invalidPasswordFormat: {
		message: 'Password must have a minimum of 8 characters',
		i18nKey: 'apiResponses.users.invalidPasswordFormat',
	},
	requiredRole: {
		message: 'Role is required',
		i18nKey: 'apiResponses.users.requiredRole',
	},
	invalidRoleFormat: {
		message: 'Role must be admin or partner',
		i18nKey: 'apiResponses.users.invalidRoleFormat',
	},
};

export const AUTHENTICATION_MESSAGES = {
	missingToken: {
		message: 'Token is missing',
		i18nKey: 'apiResponses.authentication.missingToken',
	},
	requiredToken: {
		message: 'Token is required',
		i18nKey: 'apiResponses.authentication.requiredToken',
	},
	invalidToken: {
		message: 'Invalid token',
		i18nKey: 'apiResponses.authentication.invalidToken',
	},
	notExistRefreshToken: {
		message: 'Refresh Token does not exist',
		i18nKey: 'apiResponses.authentication.notExistRefreshToken',
	},
	requiredRefreshToken: {
		message: 'Refresh token is required',
		i18nKey: 'apiResponses.authentication.requiredRefreshToken',
	},
	invalidRefreshToken: {
		message: 'Invalid refresh token',
		i18nKey: 'apiResponses.authentication.invalidRefreshToken',
	},
	invalidPermission: {
		message: 'Invalid permission',
		i18nKey: 'apiResponses.authentication.invalidPermission',
	},
	notAuthenticated: {
		message: 'User is not authenticated',
		i18nKey: 'apiResponses.authentication.notAuthenticated',
	},
	invalidCredentials: {
		message: 'Email or password incorrect',
		i18nKey: 'apiResponses.authentication.invalidCredentials',
	},
};
