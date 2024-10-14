import { beforeEach, describe, expect, it } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ListIngredientsService } from './ListIngredients.service';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let service: ListIngredientsService;

const createCategory1 = createCategoryFactory({
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
});
const createCategory2 = createCategoryFactory({
	translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
});

const { translations: translationsIngredient1 } = createIngredientFactory({
	translations: { en: { name: 'Orange syrup' }, pt: { name: 'Xarope de laranja' } },
});
const { translations: translationsIngredient2 } = createIngredientFactory({
	translations: { en: { name: 'Lime Syrup' }, pt: { name: 'Xarope de limão' } },
});
const { translations: translationsIngredient3 } = createIngredientFactory({
	translations: { en: { name: 'Orange juice' }, pt: { name: 'Suco de laranja' } },
});
const { translations: translationsIngredient4 } = createIngredientFactory({
	translations: { en: { name: 'Lime juice' }, pt: { name: 'Suco de limão' } },
});

describe('List Ingredients', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		service = new ListIngredientsService(ingredientsRepositoryInMemory);

		const category1 = await categoriesRepositoryInMemory.create(createCategory1);
		const category2 = await categoriesRepositoryInMemory.create(createCategory2);
		await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient1,
			is_alcoholic: false,
			category: category1,
		});
		await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient2,
			is_alcoholic: false,
			category: category1,
		});
		await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient3,
			is_alcoholic: false,
			category: category2,
		});
		await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient4,
			is_alcoholic: false,
			category: category2,
		});
	});

	it('should be able to list ingredients', async () => {
		const ingredientsFound = await service.execute({});

		expect(ingredientsFound.length).greaterThan(0);
		expect(ingredientsFound.length).lessThanOrEqual(DEFAULT_QUERY_PARAMS.limit);
	});

	it('should be able to list ingredients using pagination', async () => {
		const found = await service.execute({ query: { page: 1, limit: 3 } });

		expect(found.length).toEqual(3);
	});

	it('should be able to list ingredients using search term', async () => {
		const found = await service.execute({ query: { search: { 'translations.en.name': 'syrup' } } });

		expect(found.length).toEqual(2);
	});

	it('should be able to list ingredients using sort', async () => {
		const found = await service.execute({
			query: { limit: 2, page: 1, sort: { 'translations.en.name': -1 } },
		});

		expect(found.length).toEqual(2);
		expect(found[0].translations.en.name).toEqual(translationsIngredient1.en.name);
		expect(found[1].translations.en.name).toEqual(translationsIngredient3.en.name);
	});
});
