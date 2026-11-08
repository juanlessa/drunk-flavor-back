import { Intensity } from '@/core/drinks/modules/preparation/types/technique.types';
import { PhysicalVessel } from '@/core/drinks/modules/preparation/types/vessel.types';

/** Stirs what is in the mixing vessel, for a time or a number of revolutions. */
export type StirAction = { type: 'stir'; intensity?: Intensity; seconds?: number; revolutions?: number };

export type StirEvent = {
	type: 'stir';
	vessel: PhysicalVessel;
	intensity: Intensity;
	seconds?: number;
	revolutions?: number;
};
