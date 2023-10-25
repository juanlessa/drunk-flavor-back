import { docsUserTag } from '@modules/accounts/docs/user.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsCreateUserRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				surname: { type: 'string' },
				email: { type: 'string' },
				password: { type: 'string' },
				role: { type: 'string' }
			},
			example: {
				name: 'user',
				surname: 'test',
				email: 'user@test.com',
				password: '12345678',
				role: 'admin'
			}
		}
	}
};

export const docsCreateUser = {
	tags: [docsUserTag],
	summary: 'Create user',
	description: 'Create a new user, it is only allowed for admin users (role=admin)',
	security: docsUseBearerAuth,
	requestBody: { content: docsCreateUserRequestContent },
	responses: {
		'201': {
			description: 'Created'
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
