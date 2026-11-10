import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { FACTORY_CREATOR_ID } from './authorship.factories';
import { DeepPartial } from '@/shared/types/utility.types';

export const createCategoryFactory = (category?: DeepPartial<CreateCategory>): CreateCategory => ({
	translations: {
		en: { name: category?.translations?.en?.name || 'Simple syrup' },
		pt: { name: category?.translations?.pt?.name || 'Xarope simples' },
	},
	isAlcoholic: category?.isAlcoholic ?? false,
	createdBy: category?.createdBy ?? FACTORY_CREATOR_ID,
});
