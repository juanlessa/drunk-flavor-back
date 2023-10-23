import { docsCategoryDefinition, docsCategoryTag } from '@modules/drinks/docs/category.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsListCategories = {
	tags: [docsCategoryTag],
	summary: 'List categories',
	description: 'List all categories',
	security: docsUseBearerAuth,
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: docsCategoryDefinition
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
