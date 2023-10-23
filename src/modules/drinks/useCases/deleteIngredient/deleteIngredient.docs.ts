import { docsIngredientTag } from '@modules/drinks/docs/ingredient.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsDeleteIngredientRequestContent = {
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

export const docsDeleteIngredient = {
	tags: [docsIngredientTag],
	summary: 'Delete ingredient',
	description: 'Delete an ingredient',
	security: docsUseBearerAuth,
	requestBody: { content: docsDeleteIngredientRequestContent },
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
