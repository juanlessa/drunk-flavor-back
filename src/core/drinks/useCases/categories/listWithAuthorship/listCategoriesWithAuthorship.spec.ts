import { beforeEach, describe, expect, it } from 'vitest';
import { actorWithRole } from '@/core/drinks/factories/authorship.factories';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ListCategoriesWithAuthorshipService } from './ListCategoriesWithAuthorship.service';

const partner = actorWithRole(Roles.partner, 'partner-id');
const named = (name: string, createdBy: string) =>
	createCategoryFactory({ createdBy, translations: { en: { name }, pt: { name: `${name} pt` } } });

let repository: CategoriesRepositoryInMemory;
let service: ListCategoriesWithAuthorshipService;

describe('List Categories With Authorship', () => {
	beforeEach(async () => {
		repository = new CategoriesRepositoryInMemory();
		service = new ListCategoriesWithAuthorshipService(repository);
		await repository.create(named('a', 'other-id'));
		await repository.create(named('b', partner.id));
		await repository.create(named('c', 'other-id'));
		await repository.create(named('d', partner.id));
	});

	it('lists the categories of the actor first, then the others, each group in the order of the query', async () => {
		const categories = await service.execute({
			actor: partner,
			query: { sort: { 'translations.en.name': 'desc' } },
		});

		expect(categories.map((category) => category.translations.en.name)).toEqual(['d', 'b', 'c', 'a']);
	});

	it('shows who created and last edited each category', async () => {
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

	it('paginates after putting the categories of the actor first', async () => {
		const page = async (number: number) =>
			(
				await service.execute({
					actor: partner,
					query: { sort: { 'translations.en.name': 'asc' }, limit: 3, page: number },
				})
			).map((category) => category.translations.en.name);

		expect([await page(1), await page(2)]).toEqual([['b', 'd', 'a'], ['c']]);
	});

	it('applies the search', async () => {
		const categories = await service.execute({ actor: partner, query: { search: { name: 'c' } } });

		expect(categories.map((category) => category.translations.en.name)).toEqual(['c']);
	});
});
