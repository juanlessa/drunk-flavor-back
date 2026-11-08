import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeMuddle } from './muddle.analyzer';
import { renderMuddle } from './muddle.renderer';

export type { MuddleAction, MuddleEvent } from './muddle.types';

export const muddleDefinition: ActionDefinition<'muddle'> = {
	type: 'muddle',
	analyze: analyzeMuddle,
	render: renderMuddle,
};
