import { seedIngredient } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetIngredientWithAuthorshipService } from './GetIngredientWithAuthorship.service';

let repository: IngredientsRepositoryInMemory;
let service: GetIngredientWithAuthorshipService;
let seed: (createdBy: string) => ReturnType<typeof seedIngredient>;

describe('Get Ingredient With Authorship', () => {
	beforeEach(() => {
		repository = new IngredientsRepositoryInMemory();
		service = new GetIngredientWithAuthorshipService(repository);
		seed = (createdBy) =>
			seedIngredient(
				{
					categoriesRepository: new CategoriesRepositoryInMemory(),
					unitsRepository: new UnitsRepositoryInMemory(),
					ingredientsRepository: repository,
				},
				createdBy,
			);
	});

	it('gets an ingredient showing who created and last edited it', async () => {
		const { ingredient } = await seed('creator-id');
		await repository.update({ id: ingredient.id, updatedBy: 'editor-id' });

		const found = await service.execute({ id: ingredient.id });

		expect(found).toMatchObject({ id: ingredient.id, createdBy: 'creator-id', updatedBy: 'editor-id' });
	});

	it('gets an ingredient whose creator closed the account, without an author', async () => {
		const { ingredient } = await seed('creator-id');
		await repository.clearCreatorByUser('creator-id');

		const found = await service.execute({ id: ingredient.id });

		expect(found.id).toBe(ingredient.id);
		expect(found).not.toHaveProperty('createdBy');
	});

	it('rejects a nonexistent ingredient', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(NotFoundError);
	});
});
