import { beforeEach } from 'vitest';
import { describeCatalogAuthorshipContract } from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { CategoriesRepositoryInMemory } from './Categories.repository';

let repository: CategoriesRepositoryInMemory;

beforeEach(() => {
	repository = new CategoriesRepositoryInMemory();
});

describeCatalogAuthorshipContract({
	label: 'CategoriesRepositoryInMemory',
	repository: () => repository,
	create: (name, createdBy) =>
		repository.create({
			...createCategoryFactory({ translations: { en: { name }, pt: { name: `${name} pt` } } }),
			createdBy,
		}),
	update: (id, updatedBy, extra) => repository.update({ id, updatedBy, ...extra } as UpdateCategory),
});
