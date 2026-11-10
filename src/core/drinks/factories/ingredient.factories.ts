import { CreateIngredientInput } from '@/core/drinks/useCases/ingredients/create/createIngredient.dtos';
import { Genders } from '@/shared/constants/gender.constants';
import { DeepPartial } from '@/shared/types/utility.types';

export const createIngredientFactory = (ingredient?: DeepPartial<CreateIngredientInput>): CreateIngredientInput => ({
	translations: {
		en: {
			name: ingredient?.translations?.en?.name || 'Syrup',
			...(ingredient?.translations?.en?.namePlural ? { namePlural: ingredient.translations.en.namePlural } : {}),
		},
		pt: {
			name: ingredient?.translations?.pt?.name || 'Xarope',
			...(ingredient?.translations?.pt?.namePlural ? { namePlural: ingredient.translations.pt.namePlural } : {}),
			gender: ingredient?.translations?.pt?.gender ?? Genders.masculine,
		},
	},
	categoryId: ingredient?.categoryId || '',
	unitIds: (ingredient?.unitIds as string[] | undefined) ?? [],
});
