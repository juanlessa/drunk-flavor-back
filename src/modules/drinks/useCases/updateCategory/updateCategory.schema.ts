import { validateSchema } from '@middlewares/fieldsValidator';
import { IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { categoryIdValidation, categoryTranslationSchema } from '@modules/drinks/validations/categories';
import { getZodTranslationsSchema } from '@modules/drinks/validations/getZodTranslationsSchema';
import { z } from 'zod';

const updateCategorySchema = z.object({
	id: categoryIdValidation,
	translations: getZodTranslationsSchema(categoryTranslationSchema)
});

export const updateCategoryValidator = validateSchema<IUpdateCategory>(updateCategorySchema);
