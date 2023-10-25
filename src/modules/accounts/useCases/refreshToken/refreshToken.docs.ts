import { docsAuthenticationTag } from '@modules/accounts/docs/authentication.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsRefreshTokenRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				token: { type: 'string' }
			},
			example: {
				token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTY5NzMyMzUsImV4cCI6MTY5Njk4NzYzNSwic3ViIjoiNjUyNWIzNWI5YzhlN2E2ZjhiMjhlMTMwIn0.bMQMus-FBavH6CRS'
			}
		}
	}
};

const docsRefreshTokenResponseContent = {
	type: 'object',
	properties: {
		token: { type: 'string' },
		expires: { type: 'string' }
	},
	example: {
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTY5NzMyMzUsImV4cCI6MTY5Njk4NzYzNSwic3ViIjoiNjUyNWIzNWI5YzhlN2E2ZjhiMjhlMTMwIn0.bMQMus-FBavH6CRS',
		expires: '2023-10-11T01:27:15.893Z'
	}
};

export const docsRefreshToken = {
	tags: [docsAuthenticationTag],
	summary: 'Refresh token',
	description: 'Refresh user token',
	requestBody: { content: docsRefreshTokenRequestContent },
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: docsRefreshTokenResponseContent
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
