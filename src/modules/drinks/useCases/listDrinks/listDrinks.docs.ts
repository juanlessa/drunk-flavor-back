import { docsDrinkDefinition, docsDrinkTag } from '@modules/drinks/docs/drink.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

export const docsListDrinks = {
	tags: [docsDrinkTag],
	summary: 'List drinks',
	description: 'List all drinks',
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: docsDrinkDefinition
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
