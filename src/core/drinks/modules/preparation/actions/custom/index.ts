import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeCustom } from './custom.analyzer';
import { renderCustom } from './custom.renderer';

export type { CustomAction, CustomEvent } from './custom.types';

export const customDefinition: ActionDefinition<'custom'> = {
	type: 'custom',
	analyze: analyzeCustom,
	render: renderCustom,
};
