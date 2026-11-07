import {
	MixingVessels,
	ServingGlasses,
	VesselRoles,
} from '@/core/drinks/modules/preparation/constants/vessel.constants';

export type MixingVessel = (typeof MixingVessels)[keyof typeof MixingVessels];

/** A physical vessel. The mixing vessel can be the serving glass itself. */
export type PhysicalVessel = MixingVessel;

export type ServingGlass = (typeof ServingGlasses)[keyof typeof ServingGlasses];

export type VesselRole = (typeof VesselRoles)[keyof typeof VesselRoles];
