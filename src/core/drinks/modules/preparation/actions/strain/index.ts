import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { analyzeStrain } from './strain.analyzer';
import { renderStrain } from './strain.renderer';

export type { StrainAction, StrainEvent } from './strain.types';

export const strainDefinition: ActionDefinition<'strain'> = {
	type: 'strain',
	analyze: analyzeStrain,
	render: renderStrain,
};
