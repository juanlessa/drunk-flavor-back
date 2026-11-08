import { UnitKinds } from '@/core/drinks/constants/unit.constants';
import { getUnitIngredientNameIssue } from '@/core/drinks/helpers/unit.helpers';
import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { genderValidation } from '@/shared/schemas/gender.schemas';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

export const unitIdValidation = getObjectIdSchema({
	required: 'apiResponses.units.requiredId',
	invalid: 'apiResponses.units.invalidIdFormat',
});

export const unitNameValidation = z
	.string({ error: 'apiResponses.units.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.units.invalidNameFormat' satisfies LocaleKey });

export const unitNamePluralValidation = z
	.string({ error: 'apiResponses.units.requiredNamePlural' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.units.invalidNamePluralFormat' satisfies LocaleKey });

export const unitSymbolValidation = z
	.string({ error: 'apiResponses.units.invalidSymbolFormat' satisfies LocaleKey })
	.trim()
	.min(1, { error: 'apiResponses.units.invalidSymbolFormat' satisfies LocaleKey });

export const unitSpaceBeforeSymbolValidation = z.boolean({
	error: 'apiResponses.units.invalidSpaceBeforeSymbolFormat' satisfies LocaleKey,
});

export const unitAllowDecimalValidation = z.boolean({
	error: 'apiResponses.units.requiredAllowDecimal' satisfies LocaleKey,
});

export const unitKindValidation = z.enum(UnitKinds, {
	error: 'apiResponses.units.invalidKindFormat' satisfies LocaleKey,
});

export const unitUseIngredientNameValidation = z.boolean({
	error: 'apiResponses.units.invalidUseIngredientNameFormat' satisfies LocaleKey,
});

/**
 * Cross-field rule: a unit written with the name of the ingredient must be a `count` unit without a symbol.
 *
 * On update an omitted symbol keeps the current one, which the schema cannot see, so it only checks the
 * symbol when the request sends one. The domain checks the symbol the unit will end up with.
 */
export const refineUnitIngredientName = (
	unit: { useIngredientName?: boolean; kind?: string; symbol?: string | null },
	ctx: z.RefinementCtx,
) => {
	const issue = getUnitIngredientNameIssue(unit);
	if (issue) ctx.addIssue({ code: 'custom', message: issue.message, path: [issue.field] });
};

// The gender is optional per language; use `requireGenderFor` on the translations to require it where needed.
export const unitTranslationSchema = z.object({
	name: unitNameValidation,
	namePlural: unitNamePluralValidation,
	gender: genderValidation.optional(),
});
