import { docsCategoryTag, docsCategoryTranslationSchema } from '@modules/drinks/docs/category.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsUpdateCategoryRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				translations: {
					type: 'object',
					properties: {
						en: docsCategoryTranslationSchema,
						pt: docsCategoryTranslationSchema
					}
				}
			},
			example: {
				id: '651be0e87677171847560ee3',
				translations: {
					en: { name: 'syrup' },
					pt: { name: 'xarope' }
				}
			}
		}
	}
};

export const docsUpdateCategory = {
	tags: [docsCategoryTag],
	summary: 'Update category',
	description: 'Update a category',
	security: docsUseBearerAuth,
	requestBody: { content: docsUpdateCategoryRequestContent },
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
