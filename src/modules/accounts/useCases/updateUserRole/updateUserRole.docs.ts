import { docsUserTag } from '@modules/accounts/docs/user.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsUpdateUserRoleRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				role: { type: 'string' }
			},
			example: {
				id: '651be0e87677171847560ee3',
				role: 'partner'
			}
		}
	}
};

export const docsUpdateUserRole = {
	tags: [docsUserTag],
	summary: 'Update user role',
	description: 'Update a user role, it is only allowed for admin users (role=admin)',
	security: docsUseBearerAuth,
	requestBody: { content: docsUpdateUserRoleRequestContent },
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
