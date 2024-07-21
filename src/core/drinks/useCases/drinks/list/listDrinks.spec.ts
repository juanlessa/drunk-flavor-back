import { beforeEach, describe, expect, it } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ListDrinksService } from './ListDrinks.service';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory, createDrinkFactory, createIngredientFactory } from '@/core/drinks/container';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let drinksRepositoryInMemory: IDrinksRepository;
let service: ListDrinksService;

const createCategory1 = createCategoryFactory({
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
});

const { translations: translationsIngredient1 } = createIngredientFactory({
	translations: { en: { name: 'Orange syrup' }, pt: { name: 'Xarope de laranja' } },
});
const { translations: translationsIngredient2 } = createIngredientFactory({
	translations: { en: { name: 'Lime Syrup' }, pt: { name: 'Xarope de limão' } },
});
const { translations: translationsDrink1 } = createDrinkFactory({
	translations: { en: { name: 'Cosmopolitan' }, pt: { name: 'Cosmopolitan' } },
});
const { translations: translationsDrink2 } = createDrinkFactory({
	translations: { en: { name: 'Paper plane' }, pt: { name: 'Paper plane' } },
});
const { translations: translationsDrink3 } = createDrinkFactory({
	translations: { en: { name: 'Tequila sunrise' }, pt: { name: 'Tequila sunrise' } },
});

describe('List Drinks', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		service = new ListDrinksService(drinksRepositoryInMemory);

		const category1 = await categoriesRepositoryInMemory.create(createCategory1);
		const ingredient1 = await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient1,
			is_alcoholic: false,
			category: category1,
		});
		const ingredient2 = await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient2,
			is_alcoholic: false,
			category: category1,
		});
		await drinksRepositoryInMemory.create({
			translations: translationsDrink1,
			ingredients: [{ ingredient: ingredient1, quantity: 60 }],
		});
		await drinksRepositoryInMemory.create({
			translations: translationsDrink2,
			ingredients: [{ ingredient: ingredient2, quantity: 60 }],
		});
		await drinksRepositoryInMemory.create({
			translations: translationsDrink3,
			ingredients: [
				{ ingredient: ingredient1, quantity: 30 },
				{ ingredient: ingredient2, quantity: 30 },
			],
		});
	});

	it('should be able to list drinks', async () => {
		const found = await service.execute({});

		expect(found.length).greaterThan(0);
		expect(found.length).lessThanOrEqual(DEFAULT_QUERY_PARAMS.limit);
	});

	it('should be able to list drinks using pagination', async () => {
		const found = await service.execute({ query: { page: 1, limit: 3 } });

		expect(found.length).toEqual(3);
	});

	it('should be able to list drinks using search term', async () => {
		const found = await service.execute({ query: { search: { 'translations.en.name': 'Cosmopolitan' } } });

		expect(found.length).toEqual(1);
	});

	it('should be able to list drinks using sort', async () => {
		const found = await service.execute({
			query: { limit: 2, page: 1, sort: { 'translations.en.name': -1 } },
		});

		expect(found.length).toEqual(2);
		expect(found[0].translations.en.name).toEqual(translationsDrink3.en.name);
		expect(found[1].translations.en.name).toEqual(translationsDrink2.en.name);
	});
});
