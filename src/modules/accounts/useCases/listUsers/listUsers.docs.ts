import { docsUserDefinition, docsUserTag } from '@modules/accounts/docs/user.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsListUsers = {
	tags: [docsUserTag],
	summary: 'List users',
	description: 'List all users, it is only allowed for admin users (role=admin)',
	security: docsUseBearerAuth,
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: docsUserDefinition
					}
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
