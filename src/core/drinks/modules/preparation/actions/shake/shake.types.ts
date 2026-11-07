import { Intensity } from '@/core/drinks/modules/preparation/types/technique.types';

/** Shakes the mixing vessel. Whether it is a dry shake depends on the ice it holds at that point. */
export type ShakeAction = { type: 'shake'; intensity?: Intensity; seconds?: number };

export type ShakeEvent = { type: 'shake'; dry: boolean; intensity: Intensity; seconds?: number };
