import { docsIngredientDefinition } from '@modules/drinks/docs/ingredient.docs';
import { docsCategoriesPath } from './categories.docs';
import { docsInfo, docsSecuritySchemes } from './common.docs';
import { docsIngredientsPath } from './ingredients.docs';
import { docsDrinksPath } from './drinks.docs';
import { docsDrinkDefinition } from '@modules/drinks/docs/drink.docs';
import { docsCategoryDefinition } from '@modules/drinks/docs/category.docs';
import { docsAppErrorDefinition } from './errors.docs';

export default {
	openapi: '3.0.0',
	info: docsInfo,
	paths: {
		...docsCategoriesPath,
		...docsDrinksPath,
		...docsIngredientsPath
	},
	definitions: {
		Category: docsCategoryDefinition,
		...docsDrinkDefinition,
		...docsIngredientDefinition,
		AppError: docsAppErrorDefinition
	},
	components: {
		docsSecuritySchemes
	}
};
