import { docsDrinkTag, docsDrinkTranslationSchema } from '@modules/drinks/docs/drink.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsCreateDrinkRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				translations: {
					type: 'object',
					properties: {
						en: docsDrinkTranslationSchema,
						pt: docsDrinkTranslationSchema
					}
				},
				ingredients: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							quantity: { type: 'number' },
							ingredient_id: { type: 'string' }
						}
					}
				}
			},
			example: {
				translations: {
					en: { name: 'margarita', method: 'drink method ...' },
					pt: { name: 'Margarita', method: 'instruções de preparo ...' }
				},
				ingredients: [
					{
						quantity: 15,
						ingredient_id: '651be0e87677171847560ee3'
					}
				]
			}
		}
	}
};

export const docsCreateDrink = {
	tags: [docsDrinkTag],
	summary: 'Create drink',
	description: 'Create a new drink',
	security: docsUseBearerAuth,
	requestBody: { content: docsCreateDrinkRequestContent },
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
