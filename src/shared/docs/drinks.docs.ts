import { docsCreateDrink } from '@modules/drinks/useCases/createDrink/createDrink.docs';
import { docsDeleteDrink } from '@modules/drinks/useCases/deleteDrink/deleteDrink.docs';
import { docsGetDrink } from '@modules/drinks/useCases/getDrink/getDrink.docs';
import { docsListDrinks } from '@modules/drinks/useCases/listDrinks/listDrinks.docs';
import { docsUpdateDrink } from '@modules/drinks/useCases/updateDrink/updateDrink.docs';
import { docsUpdateDrinkCover } from '@modules/drinks/useCases/updateDrinkCover/updateDrinkCover.docs';
import { docsUpdateDrinkThumbnail } from '@modules/drinks/useCases/updateDrinkThumbnail/updateDrinkThumbnail.docs';

export const docsDrinksPath = {
	'/drinks': {
		post: docsCreateDrink,
		delete: docsDeleteDrink,
		get: docsListDrinks,
		patch: docsUpdateDrink
	},
	'/drinks/{id}': {
		get: docsGetDrink
	},
	'drinks/{id}/cover': {
		patch: docsUpdateDrinkCover
	},
	'drinks/{id}/thumbnail': {
		patch: docsUpdateDrinkThumbnail
	}
};
