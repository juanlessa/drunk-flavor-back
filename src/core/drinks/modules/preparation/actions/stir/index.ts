import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeStir } from './stir.analyzer';
import { renderStir } from './stir.renderer';

export type { StirAction, StirEvent } from './stir.types';

export const stirDefinition: ActionDefinition<'stir'> = {
	type: 'stir',
	analyze: analyzeStir,
	render: renderStir,
};
