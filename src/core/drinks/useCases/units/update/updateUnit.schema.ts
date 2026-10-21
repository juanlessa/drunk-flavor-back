import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	unitAllowDecimalValidation,
	unitIdValidation,
	unitKindValidation,
	unitSpaceBeforeSymbolValidation,
	unitSymbolValidation,
	unitTranslationSchema,
} from '@/core/drinks/schemas/unit.schemas';
import { z } from 'zod/v4';

export const updateUnitSchema = z.object({
	id: unitIdValidation,
	translations: generateTranslationsSchema(unitTranslationSchema),
	symbol: unitSymbolValidation.optional(),
	space_before_symbol: unitSpaceBeforeSymbolValidation.optional(),
	allow_decimal: unitAllowDecimalValidation,
	kind: unitKindValidation,
});
