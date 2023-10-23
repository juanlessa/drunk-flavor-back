export const docsInfo = {
	title: 'DrunkFlavor Documentation',
	description:
		'Welcome to the drunkflavor API documentation! This page serves as a comprehensive reference for developers who want to integrate and leverage the functionality of our backend services. Our API follow the RESTful principles and provides a set of well-defined endpoints to access and manipulate data related to alcoholic drink recipes.',
	version: '1.0.0',
	contact: {
		name: 'Juan Lessa',
		email: 'juanvlessa@ua.pt'
	}
};

export const docsSecuritySchemes = {
	bearerAuth: {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT'
	}
};

export const docsUseBearerAuth = [
	{
		bearerAuth: []
	}
];

export const docsDatabaseCommonInfo = {
	_id: { type: 'string' },
	created_at: { type: 'string' },
	updated_at: { type: 'string' }
};

export const docsDatabaseCommonInfoExample = {
	_id: '651be0e87677171847560ee3',
	created_at: '2023-10-03T09:37:44.763Z',
	updated_at: '2023-10-03T13:21:07.071Z'
};
