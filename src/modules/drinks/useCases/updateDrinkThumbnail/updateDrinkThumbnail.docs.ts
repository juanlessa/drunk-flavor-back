import { docsDrinkTag } from '@modules/drinks/docs/drink.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsUpdateDrinkThumbnailRequestContent = {
	'multipart/form-data': {
		schema: {
			type: 'object',
			properties: {
				thumbnail: {
					type: 'string',
					format: 'binary',
					description: 'image file for drink thumbnail'
				}
			}
		}
	}
};

export const docsUpdateDrinkThumbnail = {
	tags: [docsDrinkTag],
	summary: 'Update drink thumbnail',
	description: 'Update the drink thumbnail',
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
	requestBody: { content: docsUpdateDrinkThumbnailRequestContent },

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
