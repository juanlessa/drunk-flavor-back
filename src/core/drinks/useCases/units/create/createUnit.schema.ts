import { generateTranslationsSchema, requireGenderFor } from '@/core/drinks/schemas/helpers/translations.helpers';
import { Languages } from '@/core/drinks/types/translations';
import {
	unitAllowDecimalValidation,
	unitKindValidation,
	unitUseIngredientNameValidation,
	refineUnitIngredientName,
	unitSpaceBeforeSymbolValidation,
	unitSymbolValidation,
	unitTranslationSchema,
} from '@/core/drinks/schemas/unit.schemas';
import { z } from 'zod/v4';

export const createUnitSchema = z
	.object({
		translations: generateTranslationsSchema(unitTranslationSchema).superRefine(requireGenderFor(Languages.pt)),
		symbol: unitSymbolValidation.optional(),
		spaceBeforeSymbol: unitSpaceBeforeSymbolValidation.optional(),
		allowDecimal: unitAllowDecimalValidation,
		kind: unitKindValidation,
		useIngredientName: unitUseIngredientNameValidation.optional(),
	})
	.superRefine(refineUnitIngredientName);
