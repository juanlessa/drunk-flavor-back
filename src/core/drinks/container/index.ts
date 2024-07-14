import { CategoriesRepository } from '@/core/drinks/infra/mongo/repositories/Categories.repository';
import { DrinksRepository } from '@/core/drinks/infra/mongo/repositories/Drinks.repository';
import { IngredientsRepository } from '@/core/drinks/infra/mongo/repositories/Ingredients.repository';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateCategoryReqBody } from '@/core/drinks/useCases/categories/create/createCategory.dtos';
import { CreateIngredientReqBody } from '@/core/drinks/useCases/ingredients/create/createIngredient.dtos';

// repositories
const categoriesRepository: ICategoriesRepository = new CategoriesRepository();
export const resolveCategoriesRepository = () => categoriesRepository;

const drinksRepository: IDrinksRepository = new DrinksRepository();
export const resolveDrinksRepository = () => drinksRepository;

const ingredientsRepository: IIngredientsRepository = new IngredientsRepository();
export const resolveIngredientsRepository = () => ingredientsRepository;

export const createCategoryFactory = (category?: DeepPartial<CreateCategoryReqBody>): CreateCategoryReqBody => ({
	translations: {
		en: {
			name: category?.translations?.en?.name || 'Simple yrup',
		},
		pt: {
			name: category?.translations?.pt?.name || 'Xarope simples',
		},
	},
});

export const createIngredientFactory = (
	ingredient?: DeepPartial<CreateIngredientReqBody>,
): CreateIngredientReqBody => ({
	translations: {
		en: {
			name: ingredient?.translations?.en?.name || 'Syrup',
			unit: 'ml',
			unit_plural: 'ml',
		},
		pt: {
			name: ingredient?.translations?.pt?.name || 'Xarope',
			unit: 'ml',
			unit_plural: 'ml',
		},
	},
	is_alcoholic: ingredient?.is_alcoholic || false,
	category_id: ingredient?.category_id || '',
});
