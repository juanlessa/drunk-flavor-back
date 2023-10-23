import { docsCreateCategory } from '@modules/drinks/useCases/createCategory/createCategory.docs';
import { docsDeleteCategory } from '@modules/drinks/useCases/deleteCategory/deleteCategory.docs';
import { docsGetCategory } from '@modules/drinks/useCases/getCategory/getCategory.docs';

export const docsCategoriesPath = {
	'/categories': {
		post: docsCreateCategory,
		delete: docsDeleteCategory
	},
	'/categories/{id}': {
		get: docsGetCategory
	}
};
