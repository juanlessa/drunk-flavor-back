import { docsCategoryTag } from '@modules/drinks/docs/category.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsDeleteCategoryRequestContent = {
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

export const docsDeleteCategory = {
	tags: [docsCategoryTag],
	summary: 'Delete category',
	description: 'Delete a category',
	security: docsUseBearerAuth,
	requestBody: { content: docsDeleteCategoryRequestContent },
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
