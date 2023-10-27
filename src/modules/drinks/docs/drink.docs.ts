import { docsDatabaseCommonInfo, docsDatabaseCommonInfoExample } from '@shared/docs/common.docs';
import { docsIngredientExample } from '@modules/drinks/docs/ingredient.docs';

export const docsDrinkTag = 'drink';

export const docsDrinkTranslationSchema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		method: { type: 'string' }
	}
};

export const docsDrinkExample = {
	...docsDatabaseCommonInfoExample,
	translations: {
		en: { name: 'Margarita', method: 'drink method ...' },
		pt: { name: 'Margarita', method: 'modo de preparo ...' }
	},
	cover: '',
	thumbnail: '',
	ingredients: [
		{
			quantity: 15,
			ingredient: docsIngredientExample
		}
	]
};

export const docsDrinkDefinition = {
	type: 'object',
	properties: {
		...docsDatabaseCommonInfo,
		translations: {
			type: 'object',
			properties: {
				en: docsDrinkTranslationSchema,
				pt: docsDrinkTranslationSchema
			}
		},
		cover: { type: 'string' },
		thumbnail: { type: 'string' }
	},
	example: docsDrinkExample
};
