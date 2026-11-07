import {
	GarnishStyles,
	IceKinds,
	Intensities,
	RecipeLists,
	RimCoverages,
	StrainKinds,
} from '@/core/drinks/modules/preparation/constants/technique.constants';
import { VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

// These fields only check the format of what arrives. Whether an action makes sense at that point of the
// preparation (nothing to strain yet, an ingredient used twice...) is decided by the analysis, not here.

export const vesselRoleValidation = z.enum(VesselRoles, {
	error: 'apiResponses.drinks.preparation.invalidVesselRole' satisfies LocaleKey,
});

export const intensityValidation = z.enum(Intensities, {
	error: 'apiResponses.drinks.preparation.invalidIntensity' satisfies LocaleKey,
});

export const iceKindValidation = z.enum(IceKinds, {
	error: 'apiResponses.drinks.preparation.invalidIceKind' satisfies LocaleKey,
});

export const strainKindValidation = z.enum(StrainKinds, {
	error: 'apiResponses.drinks.preparation.invalidStrainKind' satisfies LocaleKey,
});

export const garnishStyleValidation = z.enum(GarnishStyles, {
	error: 'apiResponses.drinks.preparation.invalidGarnishStyle' satisfies LocaleKey,
});

export const rimCoverageValidation = z.enum(RimCoverages, {
	error: 'apiResponses.drinks.preparation.invalidRimCoverage' satisfies LocaleKey,
});

/** Seconds or revolutions: a positive whole number. */
export const durationValidation = z
	.number({ error: 'apiResponses.drinks.preparation.invalidDuration' satisfies LocaleKey })
	.int({ error: 'apiResponses.drinks.preparation.invalidDuration' satisfies LocaleKey })
	.positive({ error: 'apiResponses.drinks.preparation.invalidDuration' satisfies LocaleKey });

export const flagValidation = z.boolean({ error: 'apiResponses.drinks.preparation.invalidFlag' satisfies LocaleKey });

const invalidItemRef = 'apiResponses.drinks.preparation.invalidItemRef' satisfies LocaleKey;

/** Points at one recipe line. The ids are matched against the drink's lines by the analysis. */
export const recipeItemRefValidation = z.object(
	{
		list: z.enum(RecipeLists, { error: invalidItemRef }),
		ingredientId: z.string({ error: invalidItemRef }).trim().min(1, { error: invalidItemRef }),
		unitId: z.string({ error: invalidItemRef }).trim().min(1, { error: invalidItemRef }).optional(),
		withUnit: flagValidation.optional(),
	},
	{ error: invalidItemRef },
);

const requiredItems = 'apiResponses.drinks.preparation.requiredItems' satisfies LocaleKey;

/** One or more recipe lines. */
export const recipeItemRefsValidation = z
	.array(recipeItemRefValidation, { error: requiredItems })
	.min(1, { error: requiredItems });
