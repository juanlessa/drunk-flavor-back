import { docsDrinkTag, docsDrinkTranslationSchema } from '@modules/drinks/docs/drink.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsUpdateDrinkRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				translations: {
					type: 'object',
					properties: {
						en: docsDrinkTranslationSchema,
						pt: docsDrinkTranslationSchema
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
				}
			},
			example: {
				id: '651be0e87677171847560ee3',
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

export const docsUpdateDrink = {
	tags: [docsDrinkTag],
	summary: 'Update drink',
	description: 'Update a drink',
	security: docsUseBearerAuth,
	requestBody: { content: docsUpdateDrinkRequestContent },
	responses: {
		'201': {
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
