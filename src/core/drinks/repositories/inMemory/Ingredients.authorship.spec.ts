import { beforeEach } from 'vitest';
import {
	buildCategorySnapshot,
	buildUnitSnapshot,
	describeCatalogAuthorshipContract,
} from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { IngredientsRepositoryInMemory } from './Ingredients.repository';

let repository: IngredientsRepositoryInMemory;

beforeEach(() => {
	repository = new IngredientsRepositoryInMemory();
});

describeCatalogAuthorshipContract({
	label: 'IngredientsRepositoryInMemory',
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
