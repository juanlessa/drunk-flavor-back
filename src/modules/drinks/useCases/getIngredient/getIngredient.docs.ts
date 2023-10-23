import { docsIngredientDefinition, docsIngredientTag } from '@modules/drinks/docs/ingredient.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsGetIngredient = {
	tags: [docsIngredientTag],
	summary: 'Get ingredient',
	description: 'Get an ingredient',
	security: docsUseBearerAuth,
	parameters: [
		{
			name: 'id',
			in: 'path',
			description: 'ingredient id',
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
					schema: docsIngredientDefinition
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
