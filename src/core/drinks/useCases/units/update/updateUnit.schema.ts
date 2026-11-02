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
	// Omitted keeps the current symbol; `null` removes it (the unit has no symbol).
	symbol: unitSymbolValidation.nullable().optional(),
	spaceBeforeSymbol: unitSpaceBeforeSymbolValidation.optional(),
	allowDecimal: unitAllowDecimalValidation,
	kind: unitKindValidation,
});
