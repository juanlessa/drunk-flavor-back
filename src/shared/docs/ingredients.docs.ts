import { docsCreateIngredient } from '@modules/drinks/useCases/createIngredient/createIngredient.docs';
import { docsDeleteIngredient } from '@modules/drinks/useCases/deleteIngredient/deleteIngredient.docs';
import { docsGetIngredient } from '@modules/drinks/useCases/getIngredient/getIngredient.docs';

export const docsIngredientsPath = {
	'/ingredients': {
		post: docsCreateIngredient,
		delete: docsDeleteIngredient
	},
	'/ingredients/{id}': {
		get: docsGetIngredient
	}
};
