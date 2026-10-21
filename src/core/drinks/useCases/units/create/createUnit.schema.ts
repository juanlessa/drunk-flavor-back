import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	unitAllowDecimalValidation,
	unitKindValidation,
	unitSpaceBeforeSymbolValidation,
	unitSymbolValidation,
	unitTranslationSchema,
} from '@/core/drinks/schemas/unit.schemas';
import { z } from 'zod/v4';

export const createUnitSchema = z.object({
	translations: generateTranslationsSchema(unitTranslationSchema),
	symbol: unitSymbolValidation.optional(),
	space_before_symbol: unitSpaceBeforeSymbolValidation.optional(),
	allow_decimal: unitAllowDecimalValidation,
	kind: unitKindValidation,
});
