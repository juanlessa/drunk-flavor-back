import { docsUserDefinition, docsUserTag } from '@modules/accounts/docs/user.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsProfileUser = {
	tags: [docsUserTag],
	summary: 'Get user',
	description: 'Get user profile',
	security: docsUseBearerAuth,
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: docsUserDefinition
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
