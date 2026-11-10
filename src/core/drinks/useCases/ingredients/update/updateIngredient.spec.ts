import { beforeEach, describe, expect, it } from 'vitest';
import { withActor, withCreator } from '@/core/drinks/factories/authorship.factories';
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

		createdCategory = await categoriesRepository.create(
			withCreator({
				translations: categoryTranslations,
				isAlcoholic: false,
			}),
		);
		updatedCategory = await categoriesRepository.create(
			withCreator({
				translations: updatedCategoryTranslations,
				isAlcoholic: false,
			}),
		);
		createdUnit = await unitsRepository.create(createUnitFactory());
		updatedUnit = await unitsRepository.create(
			createUnitFactory({ translations: { en: { name: 'centiliter' }, pt: { name: 'centilitro' } } }),
		);
		createdIngredient = await ingredientsRepository.create(
			withCreator({
				translations,
				category: createdCategory,
				units: [createdUnit],
			}),
		);
	});

	it('should be able to update an ingredient', async () => {
		await service.execute(
			withActor({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitIds: [updatedUnit.id],
			}),
		);

		const findUpdatedIngredient = (await ingredientsRepository.findById(createdIngredient.id)) as Ingredient;

		expect(findUpdatedIngredient.translations).toEqual(updatedTranslations);
		expect(findUpdatedIngredient.category).toEqual(updatedCategory);
		expect(findUpdatedIngredient.units).toEqual([updatedUnit]);
	});

	it('should be able to update an ingredient to be not measurable with no units', async () => {
		await service.execute(
			withActor({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitIds: [],
			}),
		);

		const findUpdatedIngredient = (await ingredientsRepository.findById(createdIngredient.id)) as Ingredient;

		expect(findUpdatedIngredient.units).toEqual([]);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			service.execute(
				withActor({
					id: new ObjectId().toString(),
					translations: updatedTranslations,
					categoryId: updatedCategory.id,
					unitIds: [updatedUnit.id],
				}),
			),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		await ingredientsRepository.create(
			withCreator({
				translations: updatedTranslations,
				category: updatedCategory,
				units: [updatedUnit],
			}),
		);

		await expect(
			service.execute(
				withActor({
					id: createdIngredient.id,
					translations: updatedTranslations,
					categoryId: updatedCategory.id,
					unitIds: [updatedUnit.id],
				}),
			),
		).rejects.toBeInstanceOf(ConflictError);
	});
	it('should not be able to update an ingredient with a nonexistent category', async () => {
		await expect(
			service.execute(
				withActor({
					id: createdIngredient.id,
					translations: updatedTranslations,
					categoryId: new ObjectId().toString(),
					unitIds: [updatedUnit.id],
				}),
			),
		).rejects.toBeInstanceOf(BadRequestError);
	});
	it('should not be able to update an ingredient with a nonexistent unit', async () => {
		await expect(
			service.execute(
				withActor({
					id: createdIngredient.id,
					translations: updatedTranslations,
					categoryId: updatedCategory.id,
					unitIds: [new ObjectId().toString()],
				}),
			),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	describe('plural name and units written with the ingredient name', () => {
		let eachUnit: Unit;
		let lime: Ingredient;
		const fetchLime = async () => (await ingredientsRepository.findById(lime.id)) as Ingredient;
		const input = (
			translations: Parameters<UpdateIngredientService['execute']>[0]['translations'],
			unitIds: string[],
		) => ({ id: lime.id, translations, categoryId: createdCategory.id, unitIds });

		beforeEach(async () => {
			eachUnit = await unitsRepository.create(
				createUnitFactory({
					translations: {
						en: { name: 'unit', namePlural: 'units' },
						pt: { name: 'unidade', namePlural: 'unidades' },
					},
					kind: 'count',
					allowDecimal: false,
					useIngredientName: true,
				}),
			);
			lime = await ingredientsRepository.create(
				withCreator({
					translations: {
						en: { name: 'Lime', namePlural: 'Limes' },
						pt: { name: 'Limão', namePlural: 'Limões' },
					},
					category: createdCategory,
					units: [eachUnit, createdUnit],
				}),
			);
		});

		it('sets and replaces the plural name of each language', async () => {
			await service.execute(
				withActor(
					input(
						{
							en: { name: 'Lime', namePlural: 'Lime fruits' },
							pt: { name: 'Limão', namePlural: 'Limões' },
						},
						[eachUnit.id],
					),
				),
			);
			const updated = await fetchLime();
			expect(updated.translations.en.namePlural).toBe('Lime fruits');
			expect(updated.translations.pt.namePlural).toBe('Limões');
		});

		it('keeps the plural name when it is omitted, even while the unit needs it', async () => {
			await service.execute(
				withActor(input({ en: { name: 'Lime' }, pt: { name: 'Limão' } }, [eachUnit.id, createdUnit.id])),
			);
			const updated = await fetchLime();
			expect(updated.translations.en.namePlural).toBe('Limes');
			expect(updated.translations.pt.namePlural).toBe('Limões');
		});

		it('rejects removing a plural name while a unit is written with the ingredient name', async () => {
			await expect(
				service.execute(
					withActor(
						input({ en: { name: 'Lime', namePlural: null }, pt: { name: 'Limão' } }, [
							eachUnit.id,
							createdUnit.id,
						]),
					),
				),
			).rejects.toBeInstanceOf(BadRequestError);
			expect((await fetchLime()).translations.en.namePlural).toBe('Limes');
		});

		it('removes the plural names once the unit written with the ingredient name is dropped', async () => {
			await service.execute(
				withActor(
					input({ en: { name: 'Lime', namePlural: null }, pt: { name: 'Limão', namePlural: null } }, [
						createdUnit.id,
					]),
				),
			);
			const updated = await fetchLime();
			expect(updated.translations.en).not.toHaveProperty('namePlural');
			expect(updated.translations.pt).not.toHaveProperty('namePlural');
			expect(updated.units).toEqual([createdUnit]);
		});

		it('rejects adding the unit written with the ingredient name to an ingredient with no plural name', async () => {
			const gin = await ingredientsRepository.create(
				withCreator({
					translations: { en: { name: 'Gin' }, pt: { name: 'Gin' } },
					category: createdCategory,
					units: [createdUnit],
				}),
			);
			await expect(
				service.execute(
					withActor({
						id: gin.id,
						translations: { en: { name: 'Gin' }, pt: { name: 'Gin' } },
						categoryId: createdCategory.id,
						unitIds: [createdUnit.id, eachUnit.id],
					}),
				),
			).rejects.toBeInstanceOf(BadRequestError);
			expect(((await ingredientsRepository.findById(gin.id)) as Ingredient).units).toEqual([createdUnit]);
		});

		it('accepts adding the unit written with the ingredient name together with the plural names', async () => {
			const gin = await ingredientsRepository.create(
				withCreator({
					translations: { en: { name: 'Gin' }, pt: { name: 'Gin' } },
					category: createdCategory,
					units: [createdUnit],
				}),
			);
			await service.execute(
				withActor({
					id: gin.id,
					translations: { en: { name: 'Gin', namePlural: 'Gins' }, pt: { name: 'Gin', namePlural: 'Gins' } },
					categoryId: createdCategory.id,
					unitIds: [eachUnit.id, createdUnit.id],
				}),
			);
			const updated = (await ingredientsRepository.findById(gin.id)) as Ingredient;
			expect(updated.units.map(({ id }) => id)).toEqual([eachUnit.id, createdUnit.id]);
			expect(updated.translations.en.namePlural).toBe('Gins');
		});
	});

	describe('description, kind, brand and units', () => {
		const baseInput = () => ({ categoryId: createdCategory.id, unitIds: [createdUnit.id] });
		const names = (en: string, pt = en) => ({ en: { name: en }, pt: { name: pt } });

		const createBranded = (brand = 'Licor 43') =>
			ingredientsRepository.create(
				withCreator({
					translations: names('Licor 43'),
					category: createdCategory,
					units: [createdUnit],
					kind: 'branded',
					brand,
				}),
			);

		const fetch = async (id: string) => (await ingredientsRepository.findById(id)) as Ingredient;

		it('should set, keep and remove the description of each language', async () => {
			const described = await ingredientsRepository.create(
				withCreator({
					translations: {
						en: { name: 'Triple sec', description: 'Orange liqueur' },
						pt: { name: 'Triple sec', description: 'Licor de laranja' },
					},
					category: createdCategory,
					units: [createdUnit],
				}),
			);

			await service.execute(
				withActor({
					...baseInput(),
					id: described.id,
					translations: {
						en: { name: 'Triple sec', description: 'Orange-flavored liqueur' }, // replaced
						pt: { name: 'Triple sec', description: null }, // removed
					},
				}),
			);
			const afterFirst = await fetch(described.id);

			expect(afterFirst.translations.en.description).toBe('Orange-flavored liqueur');
			expect(afterFirst.translations.pt).toEqual({ name: 'Triple sec' });

			await service.execute(
				withActor({
					...baseInput(),
					id: described.id,
					translations: { en: { name: 'Triple sec' }, pt: { name: 'Triple sec' } }, // omitted: kept
				}),
			);

			expect((await fetch(described.id)).translations.en.description).toBe('Orange-flavored liqueur');
		});

		it('should be able to change the brand of a branded ingredient without stating the kind', async () => {
			const branded = await createBranded();

			await service.execute(
				withActor({ ...baseInput(), id: branded.id, translations: names('Licor 43'), brand: 'Other' }),
			);

			const updated = await fetch(branded.id);
			expect(updated.kind).toBe('branded');
			expect(updated.brand).toBe('Other');
		});

		it('should keep the kind and the brand when they are omitted', async () => {
			const branded = await createBranded();

			await service.execute(withActor({ ...baseInput(), id: branded.id, translations: names('Licor 43') }));

			const updated = await fetch(branded.id);
			expect(updated.kind).toBe('branded');
			expect(updated.brand).toBe('Licor 43');
		});

		it('should remove the brand when the ingredient becomes generic', async () => {
			const branded = await createBranded();

			await service.execute(
				withActor({ ...baseInput(), id: branded.id, translations: names('Licor 43'), kind: 'generic' }),
			);

			const updated = await fetch(branded.id);
			expect(updated.kind).toBe('generic');
			expect(updated.brand).toBeUndefined();
		});

		it('should be able to turn a generic ingredient into a branded one', async () => {
			await service.execute(
				withActor({
					...baseInput(),
					id: createdIngredient.id,
					translations: updatedTranslations,
					kind: 'branded',
					brand: 'Gabriela',
				}),
			);

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
				service.execute(
					withActor({ ...baseInput(), id: branded.id, translations: names('Licor 43'), ...extra }),
				),
			).rejects.toBeInstanceOf(BadRequestError);

			const untouched = await fetch(branded.id);
			expect(untouched.kind).toBe('branded');
			expect(untouched.brand).toBe('Licor 43');
		});

		it('should not be able to turn a generic ingredient into a branded one without a brand', async () => {
			await expect(
				service.execute(
					withActor({
						...baseInput(),
						id: createdIngredient.id,
						translations: updatedTranslations,
						kind: 'branded',
					}),
				),
			).rejects.toBeInstanceOf(BadRequestError);

			expect((await fetch(createdIngredient.id)).kind).toBe('generic');
		});

		it('should not be able to give a brand to a generic ingredient that keeps its kind', async () => {
			await expect(
				service.execute(
					withActor({
						...baseInput(),
						id: createdIngredient.id,
						translations: updatedTranslations,
						brand: 'Bols',
					}),
				),
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

			await service.execute(
				withActor({
					id: createdIngredient.id,
					translations: updatedTranslations,
					categoryId: updatedCategory.id,
					unitIds: [slice.id, createdUnit.id],
				}),
			);

			expect((await fetch(createdIngredient.id)).units.map(({ id }) => id)).toEqual([slice.id, createdUnit.id]);
		});
	});
});
