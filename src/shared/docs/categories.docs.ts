import { docsCreateCategory } from '@modules/drinks/useCases/createCategory/createCategory.docs';
import { docsDeleteCategory } from '@modules/drinks/useCases/deleteCategory/deleteCategory.docs';
import { docsGetCategory } from '@modules/drinks/useCases/getCategory/getCategory.docs';
import { docsListCategories } from '@modules/drinks/useCases/listCategories/listCategories.docs';
import { docsUpdateCategory } from '@modules/drinks/useCases/updateCategory/updateCategory.docs';

export const docsCategoriesPath = {
	'/categories': {
		post: docsCreateCategory,
		delete: docsDeleteCategory,
		get: docsListCategories,
		patch: docsUpdateCategory
	},
	'/categories/{id}': {
		get: docsGetCategory
	}
};
