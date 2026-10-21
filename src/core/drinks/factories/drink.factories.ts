import { DeepPartial } from '@/shared/types/utility.types';
import { ObjectId } from 'mongodb';
import { Drink } from '@/core/drinks/entities/drink.entity';
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

export const createPersistedDrinkFactory = (drink?: DeepPartial<Drink>): Drink => ({
	_id: new ObjectId(),
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
	cover: undefined,
	thumbnail: undefined,
	ingredients: [],
	avg_rating: 0,
	ratings_count: 0,
	created_at: new Date(),
	updated_at: new Date(),
});
