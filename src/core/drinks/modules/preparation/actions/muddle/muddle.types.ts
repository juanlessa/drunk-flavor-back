import { Intensity } from '@/core/drinks/modules/preparation/types/technique.types';
import { PhysicalVessel } from '@/core/drinks/modules/preparation/types/vessel.types';

/** Muddles what is in the mixing vessel. */
export type MuddleAction = { type: 'muddle'; intensity?: Intensity };

export type MuddleEvent = { type: 'muddle'; vessel: PhysicalVessel; intensity: Intensity };
