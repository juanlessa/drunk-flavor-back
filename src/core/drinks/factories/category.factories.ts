import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { DeepPartial } from '@/shared/types/utility.types';

export const createCategoryFactory = (category?: DeepPartial<CreateCategory>): CreateCategory => ({
	translations: {
		en: { name: category?.translations?.en?.name || 'Simple syrup' },
		pt: { name: category?.translations?.pt?.name || 'Xarope simples' },
	},
	isAlcoholic: category?.isAlcoholic ?? false,
});
