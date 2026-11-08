import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzePrepareGlass } from './prepareGlass.analyzer';
import { renderPrepareGlass } from './prepareGlass.renderer';

export type { PrepareGlassAction, PrepareGlassEvent } from './prepareGlass.types';

export const prepareGlassDefinition: ActionDefinition<'prepare_glass'> = {
	type: 'prepare_glass',
	analyze: analyzePrepareGlass,
	render: renderPrepareGlass,
};
