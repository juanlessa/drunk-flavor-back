import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteIngredientService } from './DeleteIngredient.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let service: DeleteIngredientService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
let createdUnit: Unit;
const { translations, is_alcoholic } = createIngredientFactory();

describe('Delete Ingredient', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		service = new DeleteIngredientService(ingredientsRepository);

		createdCategory = await categoriesRepository.create({ translations: categoryTranslations });
		createdUnit = await unitsRepository.create(createUnitFactory());
	});
	it('should be able to delete an ingredient', async () => {
		const createdIngredient = await ingredientsRepository.create({
			translations,
			category: createdCategory,
			unit: createdUnit,
			is_alcoholic,
		});

		await service.execute({ id: createdIngredient._id.toString() });

		const findDeledIngredient = await ingredientsRepository.findById(createdIngredient._id.toString());

		expect(findDeledIngredient).toBeNull();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
