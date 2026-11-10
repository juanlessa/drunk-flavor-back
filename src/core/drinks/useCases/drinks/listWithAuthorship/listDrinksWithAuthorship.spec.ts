import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actorWithRole } from '@/core/drinks/factories/authorship.factories';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { seedIngredient } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { ListDrinksWithAuthorshipService } from './ListDrinksWithAuthorship.service';

const partner = actorWithRole(Roles.partner, 'partner-id');

let repository: DrinksRepositoryInMemory;
let storageProvider: MockStorageProvider;
let service: ListDrinksWithAuthorshipService;
let create: (name: string, createdBy: string) => ReturnType<DrinksRepositoryInMemory['create']>;

describe('List Drinks With Authorship', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		repository = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		service = new ListDrinksWithAuthorshipService(repository, storageProvider);
		const { ingredient } = await seedIngredient({
			categoriesRepository: new CategoriesRepositoryInMemory(),
			unitsRepository: new UnitsRepositoryInMemory(),
			ingredientsRepository: new IngredientsRepositoryInMemory(),
		});
		create = (name, createdBy) =>
			repository.create({
				translations: { en: { name, method: 'Stir' }, pt: { name: `${name} pt`, method: 'Mexa' } },
				ingredients: [createDrinkIngredientFactory(ingredient)],
				createdBy,
			});
		await create('a', 'other-id');
		await create('b', partner.id);
		await create('c', 'other-id');
		await create('d', partner.id);
	});

	it('lists the drinks of the actor first, then the others, each group in the order of the query', async () => {
		const drinks = await service.execute({ actor: partner, query: { sort: { 'translations.en.name': 'desc' } } });

		expect(drinks.map((drink) => drink.translations.en.name)).toEqual(['d', 'b', 'c', 'a']);
	});

	it('shows who created and last edited each drink', async () => {
		const items = await service.execute({ actor: partner });

		expect(items.find((item) => item.translations.en.name === 'b')).toMatchObject({
			createdBy: partner.id,
			updatedBy: partner.id,
		});
		expect(items.find((item) => item.translations.en.name === 'a')).toMatchObject({
			createdBy: 'other-id',
			updatedBy: 'other-id',
		});
	});

	it('paginates after putting the drinks of the actor first', async () => {
		const page = async (number: number) =>
			(
				await service.execute({
					actor: partner,
					query: { sort: { 'translations.en.name': 'asc' }, limit: 3, page: number },
				})
			).map((drink) => drink.translations.en.name);

		expect([await page(1), await page(2)]).toEqual([['b', 'd', 'a'], ['c']]);
	});

	it('resolves the urls of the cover and the thumbnail', async () => {
		const drink = await create('e', partner.id);
		await repository.update({
			id: drink.id,
			updatedBy: partner.id,
			cover: { name: 'cover.png', mimetype: 'image/png', url: '' },
			thumbnail: { name: 'thumb.png', mimetype: 'image/png', url: '' },
		});

		const [first] = await service.execute({ actor: partner, query: { search: { name: 'e' } } });

		expect(first.cover?.url).toBe('http://mock.test/cover.png');
		expect(first.thumbnail?.url).toBe('http://mock.test/thumb.png');
	});
});
