import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateIngredientService } from './CreateIngredient.service';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { ConflictError, BadRequestError } from '@/shared/error/error.lib';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let service: CreateIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
let createdUnit: Unit;
const { translations } = createIngredientFactory();

describe('Create Ingredient', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		service = new CreateIngredientService(ingredientsRepository, categoriesRepository, unitsRepository);

		createdCategory = await categoriesRepository.create({
			translations: categoryTranslations,
			isAlcoholic: false,
		});
		createdUnit = await unitsRepository.create(createUnitFactory());
	});

	it('should be able to create a new ingredient', async () => {
		const returned = await service.execute({
			translations,
			categoryId: createdCategory.id,
			unitIds: [createdUnit.id],
		});

		const createdIngredient = (await ingredientsRepository.findByName(translations)) as Ingredient;

		expect(createdIngredient).toHaveProperty('id');
		expect(createdIngredient.translations).toEqual(translations);
		expect(createdIngredient.category).toEqual(createdCategory);
		expect(createdIngredient.units).toEqual([createdUnit]);
		expect(returned.id).toEqual(createdIngredient.id);
	});

	it('should be able to create a not measurable ingredient with no units', async () => {
		await service.execute({
			translations,
			categoryId: createdCategory.id,
			unitIds: [],
		});

		const createdIngredient = (await ingredientsRepository.findByName(translations)) as Ingredient;

		expect(createdIngredient.units).toEqual([]);
	});

	it('should not be able to create an ingredient with an existing name', async () => {
		await ingredientsRepository.create({
			translations,
			category: createdCategory,
			units: [createdUnit],
		});

		await expect(
			service.execute({
				translations,
				categoryId: createdCategory.id,
				unitIds: [createdUnit.id],
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('should not be able to create a ingredient with a nonexistent category', async () => {
		await expect(
			service.execute({
				translations,
				categoryId: new ObjectId().toString(),
				unitIds: [createdUnit.id],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to create a ingredient with a nonexistent unit', async () => {
		await expect(
			service.execute({
				translations,
				categoryId: createdCategory.id,
				unitIds: [new ObjectId().toString()],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	describe('plural name and units written with the ingredient name', () => {
		const names = (enPlural?: string, ptPlural?: string) =>
			createIngredientFactory({
				translations: {
					en: { name: 'Lime', ...(enPlural && { namePlural: enPlural }) },
					pt: { name: 'Limão', ...(ptPlural && { namePlural: ptPlural }) },
				},
			}).translations;
		let eachUnit: Unit;

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
		});

		it('creates an ingredient with the plural name of each language and the unit written with its name', async () => {
			const translations = names('Limes', 'Limões');
			await service.execute({ translations, categoryId: createdCategory.id, unitIds: [eachUnit.id] });
			const created = (await ingredientsRepository.findByName(translations)) as Ingredient;
			expect(created.translations.en.namePlural).toBe('Limes');
			expect(created.translations.pt.namePlural).toBe('Limões');
			expect(created.units).toEqual([eachUnit]);
		});

		it('keeps the other units next to the unit written with the ingredient name, in order', async () => {
			const translations = names('Limes', 'Limões');
			await service.execute({
				translations,
				categoryId: createdCategory.id,
				unitIds: [eachUnit.id, createdUnit.id],
			});
			const created = (await ingredientsRepository.findByName(translations)) as Ingredient;
			expect(created.units.map(({ id }) => id)).toEqual([eachUnit.id, createdUnit.id]);
		});

		it.each([
			{ title: 'no language', en: undefined, pt: undefined },
			{ title: 'English', en: undefined, pt: 'Limões' },
			{ title: 'Portuguese', en: 'Limes', pt: undefined },
		])(
			'rejects the unit written with the ingredient name when the plural is missing in $title',
			async ({ en, pt }) => {
				await expect(
					service.execute({
						translations: names(en, pt),
						categoryId: createdCategory.id,
						unitIds: [eachUnit.id, createdUnit.id],
					}),
				).rejects.toBeInstanceOf(BadRequestError);
				expect(await ingredientsRepository.findAll({})).toHaveLength(0);
			},
		);

		it('does not ask for a plural name when no unit is written with the ingredient name', async () => {
			await service.execute({
				translations: names(),
				categoryId: createdCategory.id,
				unitIds: [createdUnit.id],
			});
			expect(await ingredientsRepository.findAll({})).toHaveLength(1);
		});

		it('accepts a plural name even when no unit needs it', async () => {
			const translations = names('Limes', 'Limões');
			await service.execute({ translations, categoryId: createdCategory.id, unitIds: [createdUnit.id] });
			const created = (await ingredientsRepository.findByName(translations)) as Ingredient;
			expect(created.translations.en.namePlural).toBe('Limes');
		});
	});

	describe('kind, brand, description and units', () => {
		const names = (en: string, pt = en) => ({ en: { name: en }, pt: { name: pt } });

		it('should create a generic ingredient without a brand by default', async () => {
			await service.execute({ translations, categoryId: createdCategory.id, unitIds: [createdUnit.id] });

			const created = (await ingredientsRepository.findByName(translations)) as Ingredient;

			expect(created.kind).toBe('generic');
			expect(created.brand).toBeUndefined();
		});

		it('should be able to create a branded ingredient with its brand', async () => {
			await service.execute({
				translations: names('Licor 43'),
				categoryId: createdCategory.id,
				unitIds: [createdUnit.id],
				kind: 'branded',
				brand: 'Licor 43',
			});

			const created = (await ingredientsRepository.findByName(names('Licor 43'))) as Ingredient;

			expect(created.kind).toBe('branded');
			expect(created.brand).toBe('Licor 43');
		});

		it('should keep the description of each language', async () => {
			const described = {
				en: { name: 'Triple sec', description: 'Orange liqueur' },
				pt: { name: 'Triple sec', description: 'Licor de laranja' },
			};

			await service.execute({ translations: described, categoryId: createdCategory.id, unitIds: [] });

			const created = (await ingredientsRepository.findByName(described)) as Ingredient;

			expect(created.translations).toEqual(described);
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
				translations,
				categoryId: createdCategory.id,
				unitIds: [slice.id, createdUnit.id],
			});

			const created = (await ingredientsRepository.findByName(translations)) as Ingredient;

			expect(created.units.map(({ id }) => id)).toEqual([slice.id, createdUnit.id]);
		});

		it.each([
			{ title: 'a branded ingredient has no brand', extra: { kind: 'branded' as const } },
			{ title: 'a generic ingredient has a brand', extra: { kind: 'generic' as const, brand: 'Bols' } },
			{ title: 'a brand comes without a kind', extra: { brand: 'Bols' } },
		])('should not be able to create an ingredient when $title', async ({ extra }) => {
			await expect(
				service.execute({ translations, categoryId: createdCategory.id, unitIds: [createdUnit.id], ...extra }),
			).rejects.toBeInstanceOf(BadRequestError);
			expect(await ingredientsRepository.findByName(translations)).toBeNull();
		});
	});
});
