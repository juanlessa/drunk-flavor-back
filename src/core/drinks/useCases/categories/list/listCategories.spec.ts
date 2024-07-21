import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { ListCategoriesService } from './ListCategories.service';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/container';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: ListCategoriesService;

const createCategory1 = createCategoryFactory({
	translations: { en: { name: 'Fruit' }, pt: { name: 'Fruta' } },
});
const createCategory2 = createCategoryFactory({
	translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
});
const createCategory3 = createCategoryFactory({
	translations: { en: { name: 'Soda' }, pt: { name: 'Refrigerante' } },
});
const createCategory4 = createCategoryFactory({
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
});

describe('List Categories', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		service = new ListCategoriesService(categoriesRepositoryInMemory);

		await categoriesRepositoryInMemory.create(createCategory1);
		await categoriesRepositoryInMemory.create(createCategory2);
		await categoriesRepositoryInMemory.create(createCategory3);
		await categoriesRepositoryInMemory.create(createCategory4);
	});

	it('should be able to list categories', async () => {
		const categoriesFound = await service.execute({});

		expect(categoriesFound.length).greaterThan(0);
		expect(categoriesFound.length).lessThanOrEqual(DEFAULT_QUERY_PARAMS.limit);
	});

	it('should be able to list categories using pagination', async () => {
		const categoriesFound = await service.execute({ query: { page: 1, limit: 3 } });

		expect(categoriesFound.length).toEqual(3);
	});

	it('should be able to list categories using search term', async () => {
		const categoriesFound = await service.execute({ query: { search: { 'translations.en.name': 'soda' } } });

		expect(categoriesFound.length).toEqual(1);
	});

	it('should be able to list categories using sort', async () => {
		const categoriesFound = await service.execute({
			query: { limit: 2, page: 1, sort: { 'translations.en.name': -1 } },
		});

		expect(categoriesFound.length).toEqual(2);
		expect(categoriesFound[0].translations.en.name).toEqual(createCategory4.translations.en.name);
		expect(categoriesFound[1].translations.en.name).toEqual(createCategory3.translations.en.name);
	});
});
