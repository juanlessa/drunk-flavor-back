import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole } from '@/core/drinks/factories/authorship.factories';
import { seedCategoryAndUnit } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ListIngredientsWithAuthorshipService } from './ListIngredientsWithAuthorship.service';

const partner = actorWithRole(Roles.partner, 'partner-id');

let repository: IngredientsRepositoryInMemory;
let service: ListIngredientsWithAuthorshipService;
let create: (name: string, createdBy: string) => Promise<unknown>;

describe('List Ingredients With Authorship', () => {
	beforeEach(async () => {
		repository = new IngredientsRepositoryInMemory();
		service = new ListIngredientsWithAuthorshipService(repository);
		const { category, unit } = await seedCategoryAndUnit({
			categoriesRepository: new CategoriesRepositoryInMemory(),
			unitsRepository: new UnitsRepositoryInMemory(),
		});
		create = (name, createdBy) =>
			repository.create({
				translations: { en: { name }, pt: { name: `${name} pt` } },
				category,
				units: [unit],
				createdBy,
			});
		await create('a', 'other-id');
		await create('b', partner.id);
		await create('c', 'other-id');
		await create('d', partner.id);
	});

	it('lists the ingredients of the actor first, then the others, each group in the order of the query', async () => {
		const ingredients = await service.execute({
			actor: partner,
			query: { sort: { 'translations.en.name': 'desc' } },
		});

		expect(ingredients.map((ingredient) => ingredient.translations.en.name)).toEqual(['d', 'b', 'c', 'a']);
	});

	it('shows who created and last edited each ingredient', async () => {
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

	it('paginates after putting the ingredients of the actor first', async () => {
		const page = async (number: number) =>
			(
				await service.execute({
					actor: partner,
					query: { sort: { 'translations.en.name': 'asc' }, limit: 3, page: number },
				})
			).map((ingredient) => ingredient.translations.en.name);

		expect([await page(1), await page(2)]).toEqual([['b', 'd', 'a'], ['c']]);
	});
});
