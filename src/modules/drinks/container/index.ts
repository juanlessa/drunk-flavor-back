import { CategoriesRepository } from '@/modules/drinks/infra/mongo/repositories/Categories.repository';
import { DrinksRepository } from '@/modules/drinks/infra/mongo/repositories/Drinks.repository';
import { IngredientsRepository } from '@/modules/drinks/infra/mongo/repositories/Ingredients.repository';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/modules/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateCategoryReqBody } from '@/modules/drinks/useCases/categories/create/createCategory.dtos';
import { CreateIngredientReqBody } from '@/modules/drinks/useCases/ingredients/create/createIngredient.dtos';

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
