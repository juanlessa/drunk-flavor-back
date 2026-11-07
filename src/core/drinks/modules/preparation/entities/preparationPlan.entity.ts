import { PreparationAction } from './preparationAction.entity';
import { MixingVessel, ServingGlass } from '@/core/drinks/modules/preparation/types/vessel.types';

/**
 * How a drink is prepared: where, in what to serve it, and the ordered actions.
 *
 * It is plain data (no classes, no dates), so it can be stored and sent as JSON unchanged. Everything
 * in it refers to the drink by ids, never by copies of its ingredients.
 */
export type PreparationPlan = {
	mixingVessel: MixingVessel;
	servingGlass: ServingGlass;
	actions: PreparationAction[];
};
