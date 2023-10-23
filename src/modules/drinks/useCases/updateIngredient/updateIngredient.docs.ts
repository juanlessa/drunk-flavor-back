import { docsIngredientTag, docsIngredientTranslationSchema } from '@modules/drinks/docs/ingredient.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsUpdateIngredientRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				id: { type: 'string' },
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
				id: '6511e2fad0ed06f787d3e016',
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

export const docsUpdateIngredient = {
	tags: [docsIngredientTag],
	summary: 'Update ingredient',
	description: 'Update a new ingredient',
	security: docsUseBearerAuth,
	requestBody: { content: docsUpdateIngredientRequestContent },
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
