import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { Intensities } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';

export const analyzeMuddle: ActionDefinition<'muddle'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, error, warn, resolveVessel } = context;

	const vessel = resolveVessel(VesselRoles.mixing);
	if (vessels[vessel].items === 0) {
		error(IssueCodes.nothingToMuddle, actionIndex);
	}
	if (vessels[vessel].ice) {
		warn(IssueCodes.muddleWithIce, actionIndex);
	}
	emit({ type: 'muddle', vessel, intensity: action.intensity ?? Intensities.normal });
};
