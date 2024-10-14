import { DeepPartial } from '@/shared/types/utility.types';
import { CreateIngredientReqBody } from '../useCases/ingredients/create/createIngredient.dtos';

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
