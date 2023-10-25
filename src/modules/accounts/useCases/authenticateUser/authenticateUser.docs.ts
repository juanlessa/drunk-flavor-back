import { docsAuthenticationTag } from '@modules/accounts/docs/authentication.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsAuthenticateUserRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				email: { type: 'string' },
				password: { type: 'string' }
			},
			example: {
				email: 'user@test.com',
				password: '12345678'
			}
		}
	}
};

const docsAuthenticateUserResponseContent = {
	type: 'object',
	properties: {
		user: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				email: { type: 'string' }
			}
		},
		token: {
			type: 'object',
			properties: {
				token: { type: 'string' },
				expires: { type: 'string' }
			}
		},
		refresh_token: {
			type: 'object',
			properties: {
				token: { type: 'string' },
				expires: { type: 'string' }
			}
		}
	},
	example: {
		user: {
			name: 'user',
			email: 'user@test.com'
		},
		token: {
			token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTY5NzMyMzUsImV4cCI6MTY5Njk4NzYzNSwic3ViIjoiNjUyNWIzNWI5YzhlN2E2ZjhiMjhlMTMwIn0.bMQMus-FBavH6CRS',
			expires: '2023-10-11T01:27:15.893Z'
		},
		refresh_token: {
			token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWduX3Byb3BlcnR5IjoianVhbnZsZXNzYUBnbWFpbC5jb20iLCJpYXQiOjE2OTY5NzMyMzUsImV4cCI6MTY5ODI2OTIzNSwic3ViIjoi',
			expires: '2023-10-25T21:27:15.894Z'
		}
	}
};

export const docsAuthenticateUser = {
	tags: [docsAuthenticationTag],
	summary: 'Authenticate user',
	description: 'Authenticate a user',
	requestBody: { content: docsAuthenticateUserRequestContent },
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: docsAuthenticateUserResponseContent
				}
			}
		},
		'400': {
			description: 'Bad Request',
			content: {
				'application/json': {
					schema: docsAppErrorDefinition
				}
			}
		}
	}
};
