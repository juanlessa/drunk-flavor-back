import { addActionSchema } from '@/core/drinks/modules/preparation/actions/add/add.schema';
import { addIceActionSchema } from '@/core/drinks/modules/preparation/actions/addIce/addIce.schema';
import { customActionSchema } from '@/core/drinks/modules/preparation/actions/custom/custom.schema';
import { garnishActionSchema } from '@/core/drinks/modules/preparation/actions/garnish/garnish.schema';
import { muddleActionSchema } from '@/core/drinks/modules/preparation/actions/muddle/muddle.schema';
import { prepareGlassActionSchema } from '@/core/drinks/modules/preparation/actions/prepareGlass/prepareGlass.schema';
import { shakeActionSchema } from '@/core/drinks/modules/preparation/actions/shake/shake.schema';
import { stirActionSchema } from '@/core/drinks/modules/preparation/actions/stir/stir.schema';
import { strainActionSchema } from '@/core/drinks/modules/preparation/actions/strain/strain.schema';
import { topActionSchema } from '@/core/drinks/modules/preparation/actions/top/top.schema';
import { MixingVessels, ServingGlasses } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import { PreparationAction } from '@/core/drinks/modules/preparation/entities/preparationAction.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

/** Every action a plan can contain, told apart by `type`. Adding an action means adding its schema here. */
export const preparationActionValidation = z.discriminatedUnion(
	'type',
	[
		prepareGlassActionSchema,
		addActionSchema,
		addIceActionSchema,
		muddleActionSchema,
		shakeActionSchema,
		stirActionSchema,
		strainActionSchema,
		topActionSchema,
		garnishActionSchema,
		customActionSchema,
	],
	{ error: 'apiResponses.drinks.preparation.invalidActionType' satisfies LocaleKey },
) satisfies z.ZodType<PreparationAction>;

const requiredActions = 'apiResponses.drinks.preparation.requiredActions' satisfies LocaleKey;

/** The format of a plan. What its actions do to the drink is checked later, by the analysis. */
export const preparationPlanValidation = z.object(
	{
		mixingVessel: z.enum(MixingVessels, {
			error: 'apiResponses.drinks.preparation.invalidMixingVessel' satisfies LocaleKey,
		}),
		servingGlass: z.enum(ServingGlasses, {
			error: 'apiResponses.drinks.preparation.invalidServingGlass' satisfies LocaleKey,
		}),
		actions: z.array(preparationActionValidation, { error: requiredActions }).min(1, { error: requiredActions }),
	},
	{ error: 'apiResponses.drinks.preparation.requiredPreparation' satisfies LocaleKey },
) satisfies z.ZodType<PreparationPlan>;
