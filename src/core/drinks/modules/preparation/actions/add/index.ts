import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeAdd } from './add.analyzer';
import { mergeAdd, renderAdd } from './add.renderer';

export type { AddAction, AddEvent } from './add.types';

export const addDefinition: ActionDefinition<'add'> = {
	type: 'add',
	analyze: analyzeAdd,
	render: renderAdd,
	merge: mergeAdd,
};
