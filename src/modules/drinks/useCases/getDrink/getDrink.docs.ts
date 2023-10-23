import { docsDrinkDefinition, docsDrinkTag } from '@modules/drinks/docs/drink.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsGetDrink = {
	tags: [docsDrinkTag],
	summary: 'Get drink',
	description: 'Get a drink',
	parameters: [
		{
			name: 'id',
			in: 'path',
			description: 'drink id',
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
					schema: docsDrinkDefinition
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
