import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
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

export const unitKindValidation = z.enum(['volume', 'mass', 'count', 'informal'], {
	error: 'apiResponses.units.invalidKindFormat' satisfies LocaleKey,
});

export const unitTranslationSchema = z.object({
	name: unitNameValidation,
	namePlural: unitNamePluralValidation,
});
