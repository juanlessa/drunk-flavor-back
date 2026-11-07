import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeShake } from './shake.analyzer';
import { renderShake } from './shake.renderer';

export type { ShakeAction, ShakeEvent } from './shake.types';

export const shakeDefinition: ActionDefinition<'shake'> = {
	type: 'shake',
	analyze: analyzeShake,
	render: renderShake,
};
