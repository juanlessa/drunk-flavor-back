import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateIngredientService } from './CreateIngredient.service';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { BadRequestError } from '@/shared/error/error.lib';
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
		await service.execute({
			translations,
			categoryId: createdCategory.id,
			unitId: createdUnit.id,
		});

		const createdIngredient = (await ingredientsRepository.findByName(translations)) as Ingredient;

		expect(createdIngredient).toHaveProperty('id');
		expect(createdIngredient.translations).toEqual(translations);
		expect(createdIngredient.category).toEqual(createdCategory);
		expect(createdIngredient.unit).toEqual(createdUnit);
	});

	it('should not be able to create an ingredient with an existing name', async () => {
		await ingredientsRepository.create({
			translations,
			category: createdCategory,
			unit: createdUnit,
		});

		await expect(
			service.execute({
				translations,
				categoryId: createdCategory.id,
				unitId: createdUnit.id,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to create a ingredient with a nonexistent category', async () => {
		await expect(
			service.execute({
				translations,
				categoryId: new ObjectId().toString(),
				unitId: createdUnit.id,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to create a ingredient with a nonexistent unit', async () => {
		await expect(
			service.execute({
				translations,
				categoryId: createdCategory.id,
				unitId: new ObjectId().toString(),
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
