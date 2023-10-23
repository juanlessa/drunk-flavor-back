import { docsIngredientTag, docsIngredientTranslationSchema } from '@modules/drinks/docs/ingredient.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsCreateIngredientRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				translations: {
					type: 'object',
					properties: {
						en: docsIngredientTranslationSchema,
						pt: docsIngredientTranslationSchema
					}
				},
				category_id: { type: 'string' },
				is_alcoholic: { type: 'boolean' }
			},
			example: {
				translations: {
					en: { name: 'simple syrup', unit: 'ml', unit_plural: 'ml' },
					pt: { name: 'xarope simples', unit: 'ml', unit_plural: 'ml' }
				},
				category_id: '6511e2fad0ed06f787d3e016',
				is_alcoholic: false
			}
		}
	}
};

export const docsCreateIngredient = {
	tags: [docsIngredientTag],
	summary: 'Create ingredient',
	description: 'Create a new ingredient',
	security: docsUseBearerAuth,
	requestBody: { content: docsCreateIngredientRequestContent },
	responses: {
		'201': {
			description: 'Created'
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
