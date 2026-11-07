import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import { UsedItem } from '@/core/drinks/modules/preparation/entities/usedItem.entity';
import { PhysicalVessel, VesselRole } from '@/core/drinks/modules/preparation/types/vessel.types';

/** Adds ingredients to a vessel. */
export type AddAction = { type: 'add'; target: VesselRole; items: RecipeItemRef[] };

export type AddEvent = { type: 'add'; vessel: PhysicalVessel; items: UsedItem[] };
