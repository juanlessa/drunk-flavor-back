import { validateSchema } from '@shared/infra/http/middlewares/validateSchema';
import { ICreateCategory } from '@modules/drinks/dtos/category.dtos';
import { categoryTranslationSchema } from '@modules/drinks/validations/category.validations';
import { getZodTranslationsSchema } from '@modules/drinks/validations/utils/getZodTranslationsSchema';
import { z } from 'zod';

const createCategorySchema = z.object({
	translations: getZodTranslationsSchema(categoryTranslationSchema)
});

export const createCategoryValidator = validateSchema<ICreateCategory>(createCategorySchema);
