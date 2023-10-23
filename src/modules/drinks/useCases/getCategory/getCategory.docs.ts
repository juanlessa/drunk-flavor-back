import { docsCategoryDefinition, docsCategoryTag } from '@modules/drinks/docs/category.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsGetCategory = {
	tags: [docsCategoryTag],
	summary: 'Get category',
	description: 'Get a category',
	security: docsUseBearerAuth,
	parameters: [
		{
			name: 'id',
			in: 'path',
			description: 'category id',
			required: true,
			schema: {
				type: 'string'
			},
			example: '651be0e87677171847560ee3'
		}
	],
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: docsCategoryDefinition
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
