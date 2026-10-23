import { DeepPartial } from '@/shared/types/utility.types';
import { CreateIngredientReqBody } from '../useCases/ingredients/create/createIngredient.dtos';

export const createIngredientFactory = (
	ingredient?: DeepPartial<CreateIngredientReqBody>,
): CreateIngredientReqBody => ({
	translations: {
		en: {
			name: ingredient?.translations?.en?.name || 'Syrup',
		},
		pt: {
			name: ingredient?.translations?.pt?.name || 'Xarope',
		},
	},
	category_id: ingredient?.category_id || '',
	unit_id: ingredient?.unit_id || '',
});
