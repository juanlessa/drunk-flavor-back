import { docsCategoryTag, docsCategoryTranslationSchema } from '@modules/drinks/docs/category.docs';
import { docsUseBearerAuth } from '@shared/docs/common.docs';
import { docsAppErrorDefinition } from '@shared/docs/errors.docs';

const docsCreateCategoryRequestContent = {
	'application/json': {
		schema: {
			type: 'object',
			properties: {
				translations: {
					type: 'object',
					properties: {
						en: docsCategoryTranslationSchema,
						pt: docsCategoryTranslationSchema
					}
				}
			},
			example: {
				translations: {
					en: { name: 'syrup' },
					pt: { name: 'xarope' }
				}
			}
		}
	}
};

export const docsCreateCategory = {
	tags: [docsCategoryTag],
	summary: 'Create category',
	description: 'Create a new category',
	security: docsUseBearerAuth,
	requestBody: { content: docsCreateCategoryRequestContent },
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
