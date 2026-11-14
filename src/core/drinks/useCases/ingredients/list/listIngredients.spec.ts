import { beforeEach, describe, expect, it } from 'vitest';
import { FACTORY_CREATOR_ID, withCreator } from '@/core/drinks/factories/authorship.factories';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ListIngredientsService } from './ListIngredients.service';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let drinksRepository: IDrinksRepository;
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
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		service = new ListIngredientsService(ingredientsRepository, drinksRepository);

		const category1 = await categoriesRepository.create(createCategory1);
		const category2 = await categoriesRepository.create(createCategory2);
		const unit = await unitsRepository.create(createUnitFactory());
		await ingredientsRepository.create(
			withCreator({
				translations: translationsIngredient1,
				category: category1,
				units: [unit],
			}),
		);
		await ingredientsRepository.create(
			withCreator({
				translations: translationsIngredient2,
				category: category1,
				units: [unit],
			}),
		);
		await ingredientsRepository.create(
			withCreator({
				translations: translationsIngredient3,
				category: category2,
				units: [unit],
			}),
		);
		await ingredientsRepository.create(
			withCreator({
				translations: translationsIngredient4,
				category: category2,
				units: [unit],
			}),
		);
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

	describe('in use', () => {
		const createDrink = (
			name: string,
			lines: { ingredient: Ingredient; optional?: boolean }[],
			garnishes: Ingredient[] = [],
		) =>
			drinksRepository.create({
				translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
				ingredients: lines.map(({ ingredient, optional }) =>
					createDrinkIngredientFactory(ingredient, { optional }),
				),
				garnishes: garnishes.map((ingredient) => ({ ingredient, amount: { type: 'none' as const } })),
				createdBy: FACTORY_CREATOR_ID,
			});
		const namesOf = (ingredients: { translations: { en: { name: string } } }[]) =>
			ingredients.map(({ translations }) => translations.en.name).sort();

		it('lists only the ingredients that some drink uses, required or optional', async () => {
			const [orangeSyrup, limeSyrup] = await ingredientsRepository.findAll({});
			await createDrink('Drink', [{ ingredient: orangeSyrup }, { ingredient: limeSyrup, optional: true }]);

			const found = await service.execute({ inUse: true });

			expect(namesOf(found)).toEqual(namesOf([orangeSyrup, limeSyrup]));
		});

		it('does not list an ingredient that is only a garnish', async () => {
			const [orangeSyrup, limeSyrup] = await ingredientsRepository.findAll({});
			await createDrink('Drink', [{ ingredient: orangeSyrup }], [limeSyrup]);

			const found = await service.execute({ inUse: true });

			expect(namesOf(found)).toEqual(namesOf([orangeSyrup]));
		});

		it('lists an ingredient once when several drinks use it', async () => {
			const [orangeSyrup, limeSyrup] = await ingredientsRepository.findAll({});
			await createDrink('Drink 1', [{ ingredient: orangeSyrup }]);
			await createDrink('Drink 2', [{ ingredient: orangeSyrup }, { ingredient: limeSyrup, optional: true }]);

			const found = await service.execute({ inUse: true });

			expect(found).toHaveLength(2);
		});

		it('applies the search and the pagination to the ingredients in use', async () => {
			const [orangeSyrup, limeSyrup, orangeJuice] = await ingredientsRepository.findAll({});
			await createDrink('Drink', [
				{ ingredient: orangeSyrup },
				{ ingredient: limeSyrup },
				{ ingredient: orangeJuice },
			]);

			const searched = await service.execute({
				inUse: true,
				query: { search: { 'translations.en.name': 'syrup' } },
			});
			const paged = await service.execute({ inUse: true, query: { page: 2, limit: 2 } });

			expect(searched).toHaveLength(2);
			expect(paged).toHaveLength(1);
		});

		it('lists nothing when no drink exists', async () => {
			expect(await service.execute({ inUse: true })).toEqual([]);
		});

		it('lists every ingredient when inUse is false or absent', async () => {
			const [orangeSyrup] = await ingredientsRepository.findAll({});
			await createDrink('Drink', [{ ingredient: orangeSyrup }]);

			expect(await service.execute({ inUse: false })).toHaveLength(4);
			expect(await service.execute({})).toHaveLength(4);
		});
	});
});
