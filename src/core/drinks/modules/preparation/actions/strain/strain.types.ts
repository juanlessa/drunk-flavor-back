import { VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import { StrainKind } from '@/core/drinks/modules/preparation/types/technique.types';
import { PhysicalVessel, VesselRole } from '@/core/drinks/modules/preparation/types/vessel.types';

/**
 * Strains the mixing vessel. By default the drink goes to the serving glass. With `to: 'mixing'` the ice is
 * strained out and the liquid goes back to the mixing vessel (the first step of a reverse dry shake).
 */
export type StrainAction = { type: 'strain'; kind: StrainKind; to?: VesselRole; overIce?: boolean };

export type StrainEvent =
	| { type: 'strain'; destination: typeof VesselRoles.serving; kind: StrainKind; overIce: boolean }
	| { type: 'strain'; destination: typeof VesselRoles.mixing; vessel: PhysicalVessel };
