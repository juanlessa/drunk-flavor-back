import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeGarnish } from './garnish.analyzer';
import { mergeGarnish, renderGarnish } from './garnish.renderer';

export type { GarnishAction, GarnishEvent } from './garnish.types';

export const garnishDefinition: ActionDefinition<'garnish'> = {
	type: 'garnish',
	analyze: analyzeGarnish,
	render: renderGarnish,
	merge: mergeGarnish,
};
