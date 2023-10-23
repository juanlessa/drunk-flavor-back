import { docsDrinkTag } from '@modules/drinks/docs/drink.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsUpdateDrinkCoverRequestContent = {
	'multipart/form-data': {
		schema: {
			type: 'object',
			properties: {
				cover: {
					type: 'string',
					format: 'binary',
					description: 'image file for drink cover'
				}
			}
		}
	}
};

export const docsUpdateDrinkCover = {
	tags: [docsDrinkTag],
	summary: 'Update drink cover',
	description: 'Update the drink cover',
	security: docsUseBearerAuth,
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
	requestBody: { content: docsUpdateDrinkCoverRequestContent },
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
