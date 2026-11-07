import { AddEvent } from '@/core/drinks/modules/preparation/actions/add/add.types';
import { AddIceEvent } from '@/core/drinks/modules/preparation/actions/addIce/addIce.types';
import { CustomEvent } from '@/core/drinks/modules/preparation/actions/custom/custom.types';
import { GarnishEvent } from '@/core/drinks/modules/preparation/actions/garnish/garnish.types';
import { MuddleEvent } from '@/core/drinks/modules/preparation/actions/muddle/muddle.types';
import { PrepareGlassEvent } from '@/core/drinks/modules/preparation/actions/prepareGlass/prepareGlass.types';
import { ShakeEvent } from '@/core/drinks/modules/preparation/actions/shake/shake.types';
import { StirEvent } from '@/core/drinks/modules/preparation/actions/stir/stir.types';
import { StrainEvent } from '@/core/drinks/modules/preparation/actions/strain/strain.types';
import { TopEvent } from '@/core/drinks/modules/preparation/actions/top/top.types';
import { PreparationActionType } from './preparationAction.entity';

/**
 * What happens, as the analysis found it: language-neutral and ready to be written. An event has the
 * same `type` as the action that produced it.
 */
export type PreparationEvent =
	| PrepareGlassEvent
	| AddEvent
	| AddIceEvent
	| MuddleEvent
	| ShakeEvent
	| StirEvent
	| StrainEvent
	| TopEvent
	| GarnishEvent
	| CustomEvent;

/** The event of a given type, e.g. `PreparationEventOf<'shake'>`. */
export type PreparationEventOf<Type extends PreparationActionType> = Extract<PreparationEvent, { type: Type }>;
