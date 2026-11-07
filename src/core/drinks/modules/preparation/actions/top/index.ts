import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeTop } from './top.analyzer';
import { renderTop } from './top.renderer';

export type { TopAction, TopEvent } from './top.types';

export const topDefinition: ActionDefinition<'top'> = {
	type: 'top',
	analyze: analyzeTop,
	render: renderTop,
};
