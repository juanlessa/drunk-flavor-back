import { beforeAll } from 'vitest';
import {
	buildDrinkIngredientSnapshot,
	describeCatalogAuthorshipContract,
} from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { DrinkModel } from '../entities/drink.model';
import { DrinksRepository } from './Drinks.repository';

const repository = new DrinksRepository();

beforeAll(async () => {
	await DrinkModel.init();
});

describeCatalogAuthorshipContract({
	label: 'DrinksRepository',
	reset: async () => {
		await DrinkModel.deleteMany({});
	},
	repository: () => repository,
	create: (name, createdBy) =>
		repository.create({
			translations: { en: { name, method: 'Stir' }, pt: { name: `${name} pt`, method: 'Mexa' } },
			ingredients: [buildDrinkIngredientSnapshot()],
			createdBy,
		}),
	update: (id, updatedBy, extra) => repository.update({ id, updatedBy, ...extra } as UpdateDrink),
});
