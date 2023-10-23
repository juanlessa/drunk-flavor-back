import { docsCreateIngredient } from '@modules/drinks/useCases/createIngredient/createIngredient.docs';
import { docsDeleteIngredient } from '@modules/drinks/useCases/deleteIngredient/deleteIngredient.docs';
import { docsGetIngredient } from '@modules/drinks/useCases/getIngredient/getIngredient.docs';
import { docsListIngredients } from '@modules/drinks/useCases/listIngredients/listIngredients.docs';
import { docsUpdateIngredient } from '@modules/drinks/useCases/updateIngredient/updateIngredient.docs';

export const docsIngredientsPath = {
	'/ingredients': {
		post: docsCreateIngredient,
		delete: docsDeleteIngredient,
		get: docsListIngredients,
		patch: docsUpdateIngredient
	},
	'/ingredients/{id}': {
		get: docsGetIngredient
	}
};
