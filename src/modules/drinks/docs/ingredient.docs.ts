import { docsDatabaseCommonInfo, docsDatabaseCommonInfoExample } from '@shared/docs/common.docs';
import { docsCategoryDefinition, docsCategoryExample } from './category.docs';

export const docsIngredientTag = 'ingredient';

export const docsIngredientTranslationSchema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		unit: { type: 'string' },
		unit_plural: { type: 'string' }
	}
};

export const docsIngredientExample = {
	...docsDatabaseCommonInfoExample,
	translations: {
		en: { name: 'simple syrup', unit: 'ml', unit_plural: 'ml' },
		pt: { name: 'xarope simples', unit: 'ml', unit_plural: 'ml' }
	},
	is_alcoholic: false,
	category: docsCategoryExample
};

export const docsIngredientDefinition = {
	type: 'object',
	properties: {
		...docsDatabaseCommonInfo,
		translations: {
			type: 'object',
			properties: {
				en: docsIngredientTranslationSchema,
				pt: docsIngredientTranslationSchema
			}
		},
		category: docsCategoryDefinition,
		is_alcoholic: {
			type: 'boolean'
		}
	},
	example: docsIngredientExample
};
