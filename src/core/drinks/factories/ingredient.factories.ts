import { CreateIngredientDTO } from '@/core/drinks/useCases/ingredients/create/createIngredient.dtos';
import { DeepPartial } from '@/shared/types/utility.types';

export const createIngredientFactory = (ingredient?: DeepPartial<CreateIngredientDTO>): CreateIngredientDTO => ({
	translations: {
		en: { name: ingredient?.translations?.en?.name || 'Syrup' },
		pt: { name: ingredient?.translations?.pt?.name || 'Xarope' },
	},
	categoryId: ingredient?.categoryId || '',
	unitId: ingredient?.unitId || '',
});
