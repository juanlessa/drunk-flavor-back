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
const { translations, is_alcoholic } = createIngredientFactory();
const { translations: updatedTranslations, is_alcoholic: updatedIsAlcoholic } = createIngredientFactory({
	translations: {
		en: { name: 'Lime juice' },
		pt: { name: 'Suco de limão' },
	},
	is_alcoholic: true,
});
let createdIngredient: Ingredient;

describe('Update Ingredient', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		service = new UpdateIngredientService(ingredientsRepository, categoriesRepository, unitsRepository);

		createdCategory = await categoriesRepository.create({ translations: categoryTranslations });
		updatedCategory = await categoriesRepository.create({ translations: updatedCategoryTranslations });
		createdUnit = await unitsRepository.create(createUnitFactory());
		updatedUnit = await unitsRepository.create(
			createUnitFactory({ translations: { en: { name: 'centiliter' }, pt: { name: 'centilitro' } } }),
		);
		createdIngredient = await ingredientsRepository.create({
			translations,
			is_alcoholic,
			category: createdCategory,
			unit: createdUnit,
		});
	});

	it('should be able to update an ingredient', async () => {
		await service.execute({
			id: createdIngredient._id.toString(),
			translations: updatedTranslations,
			category_id: updatedCategory._id.toString(),
			unit_id: updatedUnit._id.toString(),
			is_alcoholic: updatedIsAlcoholic,
		});

		const findUpdatedIngredient = (await ingredientsRepository.findById(
			createdIngredient._id.toString(),
		)) as Ingredient;

		expect(findUpdatedIngredient.translations).toEqual(updatedTranslations);
		expect(findUpdatedIngredient.category).toEqual(updatedCategory);
		expect(findUpdatedIngredient.unit).toEqual(updatedUnit);
		expect(findUpdatedIngredient.is_alcoholic).toEqual(updatedIsAlcoholic);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				category_id: updatedCategory._id.toString(),
				unit_id: updatedUnit._id.toString(),
				is_alcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		await ingredientsRepository.create({
			translations: updatedTranslations,
			category: updatedCategory,
			unit: updatedUnit,
			is_alcoholic: updatedIsAlcoholic,
		});

		await expect(
			service.execute({
				id: createdIngredient._id.toString(),
				translations: updatedTranslations,
				category_id: updatedCategory._id.toString(),
				unit_id: updatedUnit._id.toString(),
				is_alcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
	it('should not be able to update an ingredient with a nonexistent category', async () => {
		await expect(
			service.execute({
				id: createdIngredient._id.toString(),
				translations: updatedTranslations,
				category_id: new ObjectId().toString(),
				unit_id: updatedUnit._id.toString(),
				is_alcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
	it('should not be able to update an ingredient with a nonexistent unit', async () => {
		await expect(
			service.execute({
				id: createdIngredient._id.toString(),
				translations: updatedTranslations,
				category_id: updatedCategory._id.toString(),
				unit_id: new ObjectId().toString(),
				is_alcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
