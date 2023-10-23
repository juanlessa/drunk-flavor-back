import { docsDatabaseCommonInfoExample } from './../../../shared/docs/common.docs';
import { docsDatabaseCommonInfo } from '@shared/docs/common.docs';

export const docsCategoryTag = 'category';

export const docsCategoryTranslationSchema = {
	type: 'object',
	properties: {
		name: { type: 'string' }
	}
};

export const docsCategoryExample = {
	...docsDatabaseCommonInfoExample,
	translations: {
		en: { name: 'syrup' },
		pt: { name: 'xarope' }
	}
};

export const docsCategoryDefinition = {
	type: 'object',
	properties: {
		...docsDatabaseCommonInfo,
		translations: {
			type: 'object',
			properties: {
				en: docsCategoryTranslationSchema,
				pt: docsCategoryTranslationSchema
			}
		}
	},
	example: docsCategoryExample
};
