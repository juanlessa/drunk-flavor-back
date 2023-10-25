import { docsUserTag } from '@modules/accounts/docs/user.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsDeleteUserRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				id: { type: 'string' }
			},
			example: {
				id: '646d1f52f0b839f97aa7024f'
			}
		}
	}
};

export const docsDeleteUser = {
	tags: [docsUserTag],
	summary: 'Delete user',
	description: 'Delete a user, it is only allowed for admin users (role=admin)',
	security: docsUseBearerAuth,
	requestBody: { content: docsDeleteUserRequestContent },
	responses: {
		'204': {
			description: 'Deleted'
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
