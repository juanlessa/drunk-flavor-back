import { beforeAll } from 'vitest';
import { describeCatalogAuthorshipContract } from '@/core/drinks/repositories/testing/catalogAuthorship.contract';
import { UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { CategoryModel } from '../entities/category.model';
import { CategoriesRepository } from './Categories.repository';

const repository = new CategoriesRepository();

beforeAll(async () => {
	await CategoryModel.init();
});

describeCatalogAuthorshipContract({
	label: 'CategoriesRepository',
	reset: async () => {
		await CategoryModel.deleteMany({});
	},
	repository: () => repository,
	create: (name, createdBy) =>
		repository.create({
			...createCategoryFactory({ translations: { en: { name }, pt: { name: `${name} pt` } } }),
			createdBy,
		}),
	update: (id, updatedBy, extra) => repository.update({ id, updatedBy, ...extra } as UpdateCategory),
});
