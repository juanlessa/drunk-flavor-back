import { IceKind } from '@/core/drinks/modules/preparation/types/technique.types';
import { PhysicalVessel, VesselRole } from '@/core/drinks/modules/preparation/types/vessel.types';

/** Adds ice to a vessel. */
export type AddIceAction = { type: 'add_ice'; target: VesselRole; kind: IceKind };

export type AddIceEvent = { type: 'add_ice'; vessel: PhysicalVessel; kind: IceKind };
