import { randomUUID } from 'node:crypto';
import { DeepPartial } from '@/shared/types/utility.types';
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
	ingredients: (drink?.ingredients ?? []) as CreateDrinkDTO['ingredients'],
});

export const createPersistedDrinkFactory = (drink?: DeepPartial<Drink>): Drink => ({
	id: drink?.id ?? randomUUID(),
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
	cover: drink?.cover,
	thumbnail: drink?.thumbnail,
	ingredients: (drink?.ingredients?.filter((ingredient) => ingredient !== undefined) as Drink['ingredients']) ?? [],
	avgRating: drink?.avgRating ?? 0,
	ratingsCount: drink?.ratingsCount ?? 0,
	ratingsSum: drink?.ratingsSum ?? 0,
	createdAt: (drink?.createdAt as Date | undefined) ?? new Date(),
	updatedAt: (drink?.updatedAt as Date | undefined) ?? new Date(),
});
