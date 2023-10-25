import { docsUserTag } from '@modules/accounts/docs/user.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsUpdateUserRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				surname: { type: 'string' },
				email: { type: 'string' },
				password: { type: 'string' },
				role: { type: 'string' }
			},
			example: {
				id: '651be0e87677171847560ee3',
				name: 'user',
				surname: 'test',
				email: 'user@test.com',
				password: '12345678',
				role: 'admin'
			}
		}
	}
};

export const docsUpdateUser = {
	tags: [docsUserTag],
	summary: 'Update user',
	description: 'Update a user',
	security: docsUseBearerAuth,
	requestBody: { content: docsUpdateUserRequestContent },
	responses: {
		'204': {
			description: 'Updated'
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
