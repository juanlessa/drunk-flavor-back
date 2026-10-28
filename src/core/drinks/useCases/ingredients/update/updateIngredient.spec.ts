import { beforeEach, describe, expect, it } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ObjectId } from 'mongodb';
import { UpdateIngredientService } from './UpdateIngredient.service';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError } from '@/shared/error/error.lib';
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
			unit: createdUnit,
		});
	});

	it('should be able to update an ingredient', async () => {
		await service.execute({
			id: createdIngredient.id,
			translations: updatedTranslations,
			categoryId: updatedCategory.id,
			unitId: updatedUnit.id,
		});

		const findUpdatedIngredient = (await ingredientsRepository.findById(createdIngredient.id)) as Ingredient;

		expect(findUpdatedIngredient.translations).toEqual(updatedTranslations);
		expect(findUpdatedIngredient.category).toEqual(updatedCategory);
		expect(findUpdatedIngredient.unit).toEqual(updatedUnit);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitId: updatedUnit.id,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		await ingredientsRepository.create({
			translations: updatedTranslations,
			category: updatedCategory,
			unit: updatedUnit,
		});

		await expect(
			service.execute({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitId: updatedUnit.id,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
	it('should not be able to update an ingredient with a nonexistent category', async () => {
		await expect(
			service.execute({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: new ObjectId().toString(),
				unitId: updatedUnit.id,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
	it('should not be able to update an ingredient with a nonexistent unit', async () => {
		await expect(
			service.execute({
				id: createdIngredient.id,
				translations: updatedTranslations,
				categoryId: updatedCategory.id,
				unitId: new ObjectId().toString(),
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
