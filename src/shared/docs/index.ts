import { docsAuthenticationsPath } from './authentications.docs';
import { docsIngredientDefinition } from '@modules/drinks/docs/ingredient.docs';
import { docsCategoriesPath } from './categories.docs';
import { docsInfo, docsSecuritySchemes } from './common.docs';
import { docsIngredientsPath } from './ingredients.docs';
import { docsDrinksPath } from './drinks.docs';
import { docsDrinkDefinition } from '@modules/drinks/docs/drink.docs';
import { docsCategoryDefinition } from '@modules/drinks/docs/category.docs';
import { docsAppErrorDefinition } from './errors.docs';
import { docsUserDefinition } from '@modules/accounts/docs/user.docs';
import { docsUsersPath } from './users.docs';

export default {
	openapi: '3.0.0',
	info: docsInfo,
	paths: {
		...docsAuthenticationsPath,
		...docsCategoriesPath,
		...docsDrinksPath,
		...docsIngredientsPath,
		...docsUsersPath
	},
	definitions: {
		Category: docsCategoryDefinition,
		...docsDrinkDefinition,
		...docsIngredientDefinition,
		User: docsUserDefinition,
		AppError: docsAppErrorDefinition
	},
	components: {
		docsSecuritySchemes
	}
};
