import { validateSchema } from '@shared/infra/http/middlewares/validateSchema';
import { IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { categoryIdValidation, categoryTranslationSchema } from '@modules/drinks/validations/category.validations';
import { getZodTranslationsSchema } from '@modules/drinks/validations/utils/getZodTranslationsSchema';
import { z } from 'zod';

const updateCategorySchema = z.object({
	id: categoryIdValidation,
	translations: getZodTranslationsSchema(categoryTranslationSchema)
});

export const updateCategoryValidator = validateSchema<IUpdateCategory>(updateCategorySchema);
