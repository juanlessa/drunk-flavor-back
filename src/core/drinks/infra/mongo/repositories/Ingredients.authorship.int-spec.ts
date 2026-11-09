import { beforeAll } from 'vitest';
import {
	buildCategorySnapshot,
	buildUnitSnapshot,
	describeCatalogAuthorshipContract,
} from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { IngredientModel } from '../entities/ingredient.model';
import { IngredientsRepository } from './Ingredients.repository';

const repository = new IngredientsRepository();

beforeAll(async () => {
	await IngredientModel.init();
});

describeCatalogAuthorshipContract({
	label: 'IngredientsRepository',
	reset: async () => {
		await IngredientModel.deleteMany({});
	},
	repository: () => repository,
	create: (name, createdBy) =>
		repository.create({
			translations: { en: { name }, pt: { name: `${name} pt` } },
			category: buildCategorySnapshot(),
			units: [buildUnitSnapshot()],
			createdBy,
		}),
	update: (id, updatedBy, extra) => repository.update({ id, updatedBy, ...extra } as UpdateIngredient),
});
