import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { GetIngredientService } from './GetIngredient.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let service: GetIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
let createdUnit: Unit;
const { translations } = createIngredientFactory();

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		service = new GetIngredientService(ingredientsRepository);

		createdCategory = await categoriesRepository.create({
			translations: categoryTranslations,
			isAlcoholic: false,
		});
		createdUnit = await unitsRepository.create(createUnitFactory());
	});
	it('should be able to find an ingredient', async () => {
		const createdIngredient = await ingredientsRepository.create({
			translations,
			category: createdCategory,
			unit: createdUnit,
		});

		const ingredientFound = await service.execute({ id: createdIngredient.id });

		expect(ingredientFound.id).toEqual(createdIngredient.id);
		expect(ingredientFound.translations).toEqual(createdIngredient.translations);
		expect(ingredientFound.category).toEqual(createdCategory);
		expect(ingredientFound.unit).toEqual(createdUnit);
	});

	it('should not be able to find a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
