import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withCreator, withEditor } from '@/core/drinks/factories/authorship.factories';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { MatchDrinksService } from './MatchDrinks.service';

let ingredientsRepository: IngredientsRepositoryInMemory;
let drinksRepository: DrinksRepositoryInMemory;
let storageProvider: MockStorageProvider;
let service: MatchDrinksService;
let gin: Ingredient;
let lime: Ingredient;
let sugar: Ingredient;

const createDrink = (name: string, ingredients: Ingredient[]): Promise<Drink> =>
	drinksRepository.create(
		withCreator({
			translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
			ingredients: ingredients.map((ingredient) => createDrinkIngredientFactory(ingredient)),
		}),
	);

describe('Match Drinks', () => {
	beforeEach(async () => {
		const categoriesRepository = new CategoriesRepositoryInMemory();
		const unitsRepository = new UnitsRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		service = new MatchDrinksService(drinksRepository, storageProvider);

		const category = await categoriesRepository.create(createCategoryFactory());
		const unit = await unitsRepository.create(createUnitFactory());
		const build = (name: string) => {
			const { translations } = createIngredientFactory({ translations: { en: { name }, pt: { name } } });
			return ingredientsRepository.create(withCreator({ translations, category, units: [unit] }));
		};
		[gin, lime, sugar] = await Promise.all([build('Gin'), build('Lime'), build('Sugar')]);
	});

	it('should be able to find the drinks that can be made with the ingredients given', async () => {
		const gimlet = await createDrink('Gimlet', [gin, lime]);
		await createDrink('Daiquiri', [sugar]);

		const { items } = await service.execute({ ingredientIds: [gin.id, lime.id], maxMissing: 0 });

		expect(items.map(({ drink }) => drink.id)).toEqual([gimlet.id]);
	});

	it('should tell how many required ingredients each drink is missing, and which ones', async () => {
		await createDrink('Gin sour', [gin, lime, sugar]);

		const { items } = await service.execute({ ingredientIds: [gin.id, lime.id], maxMissing: 1 });

		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({ missingCount: 1, missingIngredientIds: [sugar.id] });
	});

	it('should report no missing ingredient for a drink that can be made as it is', async () => {
		await createDrink('Gimlet', [gin, lime]);

		const { items } = await service.execute({ ingredientIds: [gin.id, lime.id, sugar.id], maxMissing: 0 });

		expect(items[0]).toMatchObject({ missingCount: 0, missingIngredientIds: [] });
	});

	it('should hand the search the ingredients, the limit of missing ingredients and the page', async () => {
		const search = vi.spyOn(drinksRepository, 'findByIngredients');

		await service.execute({ ingredientIds: [gin.id], maxMissing: 'any', limit: 5, page: 2 });

		expect(search).toHaveBeenCalledWith({ ingredientIds: [gin.id], maxMissing: 'any', limit: 5, page: 2 });
	});

	it('should keep the order the search found the drinks in', async () => {
		await createDrink('Gin sour', [gin, lime, sugar]);
		await createDrink('Gimlet', [gin, lime]);

		const { items } = await service.execute({ ingredientIds: [gin.id, lime.id], maxMissing: 'any' });

		expect(items.map(({ drink }) => drink.translations.en.name)).toEqual(['Gimlet', 'Gin sour']);
	});

	it('should be able to page through the drinks found', async () => {
		await createDrink('Gimlet', [gin, lime]);
		await createDrink('Gin sour', [gin, lime, sugar]);
		await createDrink('Gin only', [gin]);

		const first = await service.execute({ ingredientIds: [gin.id, lime.id], maxMissing: 'any', limit: 2, page: 1 });
		const second = await service.execute({
			ingredientIds: [gin.id, lime.id],
			maxMissing: 'any',
			limit: 2,
			page: 2,
		});

		expect(first.items).toHaveLength(2);
		expect(second.items).toHaveLength(1);
	});

	it('should add the url of the cover and of the thumbnail to the drinks found', async () => {
		const gimlet = await createDrink('Gimlet', [gin, lime]);
		await drinksRepository.update(
			withEditor({
				id: gimlet.id,
				cover: { name: 'cover.png', mimetype: 'image/png', url: '' },
				thumbnail: { name: 'thumbnail.jpeg', mimetype: 'image/jpeg', url: '' },
			}),
		);

		const { items } = await service.execute({ ingredientIds: [gin.id, lime.id], maxMissing: 0 });

		expect(items[0]?.drink.cover?.url).toBe('http://mock.test/cover.png');
		expect(items[0]?.drink.thumbnail?.url).toBe('http://mock.test/thumbnail.jpeg');
	});

	it('should not look for images of the drinks that have none', async () => {
		await createDrink('Gimlet', [gin, lime]);

		await service.execute({ ingredientIds: [gin.id, lime.id], maxMissing: 0 });

		expect(storageProvider.getFileURL).not.toHaveBeenCalled();
	});

	it('should return no drink when none uses the ingredients given', async () => {
		await createDrink('Daiquiri', [sugar]);

		const result = await service.execute({ ingredientIds: [gin.id], maxMissing: 'any' });

		expect(result).toEqual({ items: [] });
	});
});
