import { AddAction } from '@/core/drinks/modules/preparation/actions/add/add.types';
import { AddIceAction } from '@/core/drinks/modules/preparation/actions/addIce/addIce.types';
import { CustomAction } from '@/core/drinks/modules/preparation/actions/custom/custom.types';
import { GarnishAction } from '@/core/drinks/modules/preparation/actions/garnish/garnish.types';
import { MuddleAction } from '@/core/drinks/modules/preparation/actions/muddle/muddle.types';
import { PrepareGlassAction } from '@/core/drinks/modules/preparation/actions/prepareGlass/prepareGlass.types';
import { ShakeAction } from '@/core/drinks/modules/preparation/actions/shake/shake.types';
import { StirAction } from '@/core/drinks/modules/preparation/actions/stir/stir.types';
import { StrainAction } from '@/core/drinks/modules/preparation/actions/strain/strain.types';
import { TopAction } from '@/core/drinks/modules/preparation/actions/top/top.types';

/** Every action a plan can contain. Adding an action means adding it here, in the event union and in the registry. */
export type PreparationAction =
	| PrepareGlassAction
	| AddAction
	| AddIceAction
	| MuddleAction
	| ShakeAction
	| StirAction
	| StrainAction
	| TopAction
	| GarnishAction
	| CustomAction;

/** The discriminant of an action, e.g. `'add'`. */
export type PreparationActionType = PreparationAction['type'];

/** The action of a given type, e.g. `PreparationActionOf<'shake'>`. */
export type PreparationActionOf<Type extends PreparationActionType> = Extract<PreparationAction, { type: Type }>;
