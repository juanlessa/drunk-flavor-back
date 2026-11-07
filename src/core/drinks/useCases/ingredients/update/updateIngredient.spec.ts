import { beforeEach, describe, expect, it } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { UpdateIngredientService } from './UpdateIngredient.service';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { NotFoundError, ConflictError, BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let service: UpdateIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
const { translations: updatedCategoryTranslations } = createCategoryFactory({
	translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
});
let createdCategory: Category;
let updatedCategory: Category;
let createdUnit: Unit;
let updatedUnit: Unit;
const { translations } = createIngredientFactory();
const { translations: updatedTranslations } = createIngredientFactory({
	translations: {
		en: { name: 'Lime juice' },
		pt: { name: 'Suco de limão' },
	},
});
let createdIngredient: Ingredient;

describe('Update Ingredient', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		service = new UpdateIngredientService(ingredientsRepository, categoriesRepository, unitsRepository);

		createdCategory = await categoriesRepository.create({
			translations: categoryTranslations,
			isAlcoholic: false,
		});
		updatedCategory = await categoriesRepository.create({
			translations: updatedCategoryTranslations,
			isAlcoholic: false,
		});
		createdUnit = await unitsRepository.create(createUnitFactory());
		updatedUnit = await unitsRepository.create(
			createUnitFactory({ translations: { en: { name: 'centiliter' }, pt: { name: 'centilitro' } } }),
		);
		createdIngredient = await ingredientsRepository.create({
			translations,
			category: createdCategory,
			units: [createdUnit],
		});
	});

	it('should be able to update an ingredient', async () => {
		await service.execute({
			id: createdIngredient.id,
			translations: updatedTranslations,
			categoryId: updatedCategory.id,
			unitIds: [updatedUnit.id],
		});

		const findUpdatedIngredient = (await ingredientsRepository.findById(createdIngredient.id)) as Ingredient;

		expect(findUpdatedIngredient.translations).toEqual(updatedTranslations);
		expect(findUpdatedIngredient.category).toEqual(updatedCategory);
		expect(findUpdatedIngredient.units).toEqual([updatedUnit]);
	});

	it('should be able to update an ingredient to be not measurable with no units', async () => {
		await service.execute({
			id: createdIngredient.id,
			translations: updatedTranslations,
			categoryId: updatedCategory.id,
			unitIds: [],
		});

		const findUpdatedIngredient = (await ingredientsRepository.findById(createdIngredient.id)) as Ingredient;

		expect(findUpdatedIngredient.units).toEqual([]);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitIds: [updatedUnit.id],
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		await ingredientsRepository.create({
			translations: updatedTranslations,
			category: updatedCategory,
			units: [updatedUnit],
		});

		await expect(
			service.execute({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitIds: [updatedUnit.id],
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});
	it('should not be able to update an ingredient with a nonexistent category', async () => {
		await expect(
			service.execute({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: new ObjectId().toString(),
				unitIds: [updatedUnit.id],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
	it('should not be able to update an ingredient with a nonexistent unit', async () => {
		await expect(
			service.execute({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitIds: [new ObjectId().toString()],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	describe('description, kind, brand and units', () => {
		const baseInput = () => ({ categoryId: createdCategory.id, unitIds: [createdUnit.id] });
		const names = (en: string, pt = en) => ({ en: { name: en }, pt: { name: pt } });

		const createBranded = (brand = 'Licor 43') =>
			ingredientsRepository.create({
				translations: names('Licor 43'),
				category: createdCategory,
				units: [createdUnit],
				kind: 'branded',
				brand,
			});

		const fetch = async (id: string) => (await ingredientsRepository.findById(id)) as Ingredient;

		it('should set, keep and remove the description of each language', async () => {
			const described = await ingredientsRepository.create({
				translations: {
					en: { name: 'Triple sec', description: 'Orange liqueur' },
					pt: { name: 'Triple sec', description: 'Licor de laranja' },
				},
				category: createdCategory,
				units: [createdUnit],
			});

			await service.execute({
				...baseInput(),
				id: described.id,
				translations: {
					en: { name: 'Triple sec', description: 'Orange-flavored liqueur' }, // replaced
					pt: { name: 'Triple sec', description: null }, // removed
				},
			});
			const afterFirst = await fetch(described.id);

			expect(afterFirst.translations.en.description).toBe('Orange-flavored liqueur');
			expect(afterFirst.translations.pt).toEqual({ name: 'Triple sec' });

			await service.execute({
				...baseInput(),
				id: described.id,
				translations: { en: { name: 'Triple sec' }, pt: { name: 'Triple sec' } }, // omitted: kept
			});

			expect((await fetch(described.id)).translations.en.description).toBe('Orange-flavored liqueur');
		});

		it('should be able to change the brand of a branded ingredient without stating the kind', async () => {
			const branded = await createBranded();

			await service.execute({ ...baseInput(), id: branded.id, translations: names('Licor 43'), brand: 'Other' });

			const updated = await fetch(branded.id);
			expect(updated.kind).toBe('branded');
			expect(updated.brand).toBe('Other');
		});

		it('should keep the kind and the brand when they are omitted', async () => {
			const branded = await createBranded();

			await service.execute({ ...baseInput(), id: branded.id, translations: names('Licor 43') });

			const updated = await fetch(branded.id);
			expect(updated.kind).toBe('branded');
			expect(updated.brand).toBe('Licor 43');
		});

		it('should remove the brand when the ingredient becomes generic', async () => {
			const branded = await createBranded();

			await service.execute({ ...baseInput(), id: branded.id, translations: names('Licor 43'), kind: 'generic' });

			const updated = await fetch(branded.id);
			expect(updated.kind).toBe('generic');
			expect(updated.brand).toBeUndefined();
		});

		it('should be able to turn a generic ingredient into a branded one', async () => {
			await service.execute({
				...baseInput(),
				id: createdIngredient.id,
				translations: updatedTranslations,
				kind: 'branded',
				brand: 'Gabriela',
			});

			const updated = await fetch(createdIngredient.id);
			expect(updated.kind).toBe('branded');
			expect(updated.brand).toBe('Gabriela');
		});

		it.each([
			{ title: 'the brand is removed from a branded ingredient', extra: { brand: null } },
			{ title: 'a generic kind comes with a brand', extra: { kind: 'generic' as const, brand: 'Bols' } },
		])('should not be able to update a branded ingredient when $title', async ({ extra }) => {
			const branded = await createBranded();

			await expect(
				service.execute({ ...baseInput(), id: branded.id, translations: names('Licor 43'), ...extra }),
			).rejects.toBeInstanceOf(BadRequestError);

			const untouched = await fetch(branded.id);
			expect(untouched.kind).toBe('branded');
			expect(untouched.brand).toBe('Licor 43');
		});

		it('should not be able to turn a generic ingredient into a branded one without a brand', async () => {
			await expect(
				service.execute({
					...baseInput(),
					id: createdIngredient.id,
					translations: updatedTranslations,
					kind: 'branded',
				}),
			).rejects.toBeInstanceOf(BadRequestError);

			expect((await fetch(createdIngredient.id)).kind).toBe('generic');
		});

		it('should not be able to give a brand to a generic ingredient that keeps its kind', async () => {
			await expect(
				service.execute({
					...baseInput(),
					id: createdIngredient.id,
					translations: updatedTranslations,
					brand: 'Bols',
				}),
			).rejects.toBeInstanceOf(BadRequestError);
		});

		it('should keep the order of the units', async () => {
			const slice = await unitsRepository.create(
				createUnitFactory({
					translations: {
						en: { name: 'slice', namePlural: 'slices' },
						pt: { name: 'fatia', namePlural: 'fatias' },
					},
				}),
			);

			await service.execute({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitIds: [slice.id, createdUnit.id],
			});

			expect((await fetch(createdIngredient.id)).units.map(({ id }) => id)).toEqual([slice.id, createdUnit.id]);
		});
	});
});
