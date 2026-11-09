import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetDrinkWithAuthorshipService } from './GetDrinkWithAuthorship.service';

let repository: DrinksRepositoryInMemory;
let service: GetDrinkWithAuthorshipService;
let seed: (createdBy: string) => ReturnType<typeof seedDrink>;

describe('Get Drink With Authorship', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		repository = new DrinksRepositoryInMemory();
		service = new GetDrinkWithAuthorshipService(repository, new MockStorageProvider());
		seed = (createdBy) =>
			seedDrink(
				{
					categoriesRepository: new CategoriesRepositoryInMemory(),
					unitsRepository: new UnitsRepositoryInMemory(),
					ingredientsRepository: new IngredientsRepositoryInMemory(),
					drinksRepository: repository,
				},
				createdBy,
			);
	});

	it('gets a drink showing who created and last edited it', async () => {
		const { drink } = await seed('creator-id');
		await repository.update({ id: drink.id, updatedBy: 'editor-id' });

		const found = await service.execute({ id: drink.id });

		expect(found).toMatchObject({ id: drink.id, createdBy: 'creator-id', updatedBy: 'editor-id' });
	});

	it('resolves the urls of the cover and the thumbnail', async () => {
		const { drink } = await seed('creator-id');
		await repository.update({
			id: drink.id,
			updatedBy: 'creator-id',
			cover: { name: 'cover.png', mimetype: 'image/png', url: '' },
			thumbnail: { name: 'thumb.png', mimetype: 'image/png', url: '' },
		});

		const found = await service.execute({ id: drink.id });

		expect(found.cover?.url).toBe('http://mock.test/cover.png');
		expect(found.thumbnail?.url).toBe('http://mock.test/thumb.png');
	});

	it('gets a drink whose creator closed the account, without an author', async () => {
		const { drink } = await seed('creator-id');
		await repository.clearCreatorByUser('creator-id');

		const found = await service.execute({ id: drink.id });

		expect(found.id).toBe(drink.id);
		expect(found).not.toHaveProperty('createdBy');
	});

	it('rejects a nonexistent drink', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
	});
});
