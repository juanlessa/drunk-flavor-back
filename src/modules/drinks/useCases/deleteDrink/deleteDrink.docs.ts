import { docsDrinkTag } from '@modules/drinks/docs/drink.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsDeleteDrinkRequestContent = {
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

export const docsDeleteDrink = {
	tags: [docsDrinkTag],
	summary: 'Delete drink',
	description: 'Delete a drink',
	security: docsUseBearerAuth,
	requestBody: { content: docsDeleteDrinkRequestContent },
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
