import { docsIngredientDefinition, docsIngredientTag } from '@modules/drinks/docs/ingredient.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsListIngredients = {
	tags: [docsIngredientTag],
	summary: 'List ingredients',
	description: 'List all ingredients',
	security: docsUseBearerAuth,
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: docsIngredientDefinition
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
