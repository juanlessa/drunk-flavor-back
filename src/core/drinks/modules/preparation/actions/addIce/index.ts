import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeAddIce } from './addIce.analyzer';
import { renderAddIce } from './addIce.renderer';

export type { AddIceAction, AddIceEvent } from './addIce.types';

export const addIceDefinition: ActionDefinition<'add_ice'> = {
	type: 'add_ice',
	analyze: analyzeAddIce,
	render: renderAddIce,
};
