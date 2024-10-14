import { DeepPartial } from '@/shared/types/utility.types';
import { CreateCategoryReqBody } from '../useCases/categories/create/createCategory.dtos';

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
