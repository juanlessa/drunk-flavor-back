import { DeepPartial } from '@/shared/types/utility.types';
import { CreateDrinkDTO } from '../useCases/drinks/create/createDrink.dtos';

export const createDrinkFactory = (drink?: DeepPartial<CreateDrinkDTO>): CreateDrinkDTO => ({
	translations: {
		en: {
			name: drink?.translations?.en?.name || 'Tequila sunrise',
			method: drink?.translations?.en?.method || 'preparation instructions ...',
		},
		pt: {
			name: drink?.translations?.pt?.name || 'Tequila sunrise',
			method: drink?.translations?.pt?.method || 'Modo de preparo ...',
		},
	},
	ingredients: [],
});
