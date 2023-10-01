import { validateSchema } from '@middlewares/fieldsValidator';
import { ICreateCategory } from '@modules/drinks/dtos/category.dtos';
import { categoryTranslationSchema } from '@modules/drinks/validations/categories';
import { getZodTranslationsSchema } from '@modules/drinks/validations/getZodTranslationsSchema';
import { z } from 'zod';

const createCategorySchema = z.object({
	translations: getZodTranslationsSchema(categoryTranslationSchema)
});

export const createCategoryValidator = validateSchema<ICreateCategory>(createCategorySchema);
