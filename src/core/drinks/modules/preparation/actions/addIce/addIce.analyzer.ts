import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';

export const analyzeAddIce: ActionDefinition<'add_ice'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, warn, resolveVessel } = context;

	const vessel = resolveVessel(action.target);
	if (vessels[vessel].ice) {
		warn(IssueCodes.iceAlreadyPresent, actionIndex);
	}
	vessels[vessel].ice = true;
	emit({ type: 'add_ice', vessel, kind: action.kind });
};
