import { beforeEach } from 'vitest';
import {
	buildDrinkIngredientSnapshot,
	describeCatalogAuthorshipContract,
} from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { DrinksRepositoryInMemory } from './Drinks.repository';

let repository: DrinksRepositoryInMemory;

beforeEach(() => {
	repository = new DrinksRepositoryInMemory();
});

describeCatalogAuthorshipContract({
	label: 'DrinksRepositoryInMemory',
	repository: () => repository,
	create: (name, createdBy) =>
		repository.create({
			translations: { en: { name, method: 'Stir' }, pt: { name: `${name} pt`, method: 'Mexa' } },
			ingredients: [buildDrinkIngredientSnapshot()],
			createdBy,
		}),
	update: (id, updatedBy, extra) => repository.update({ id, updatedBy, ...extra } as UpdateDrink),
});
