import { docsCreateDrink } from '@modules/drinks/useCases/createDrink/createDrink.docs';
import { docsDeleteDrink } from '@modules/drinks/useCases/deleteDrink/deleteDrink.docs';
import { docsGetDrink } from '@modules/drinks/useCases/getDrink/getDrink.docs';

export const docsDrinksPath = {
	'/drinks': {
		post: docsCreateDrink,
		delete: docsDeleteDrink
	},
	'/drinks/{id}': {
		get: docsGetDrink
	}
};
