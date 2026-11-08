import { generateTranslationsSchema, requireGenderFor } from '@/core/drinks/schemas/helpers/translations.helpers';
import { Languages } from '@/core/drinks/types/translations';
import {
	unitAllowDecimalValidation,
	unitIdValidation,
	unitKindValidation,
	unitUseIngredientNameValidation,
	refineUnitIngredientName,
	unitSpaceBeforeSymbolValidation,
	unitSymbolValidation,
	unitTranslationSchema,
} from '@/core/drinks/schemas/unit.schemas';
import { z } from 'zod/v4';

export const updateUnitSchema = z
	.object({
		id: unitIdValidation,
		translations: generateTranslationsSchema(unitTranslationSchema).superRefine(requireGenderFor(Languages.pt)),
		// Omitted keeps the current symbol; `null` removes it (the unit has no symbol).
		symbol: unitSymbolValidation.nullable().optional(),
		spaceBeforeSymbol: unitSpaceBeforeSymbolValidation.optional(),
		allowDecimal: unitAllowDecimalValidation,
		kind: unitKindValidation,
		// Omitted keeps the current value.
		useIngredientName: unitUseIngredientNameValidation.optional(),
	})
	.superRefine(refineUnitIngredientName);
