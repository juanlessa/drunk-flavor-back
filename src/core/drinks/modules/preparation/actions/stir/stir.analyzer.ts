import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { Intensities } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';

export const analyzeStir: ActionDefinition<'stir'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, error, warn, resolveVessel } = context;

	const vessel = resolveVessel(VesselRoles.mixing);
	if (vessels[vessel].items === 0) {
		error(IssueCodes.nothingToStir, actionIndex);
	} else if (!vessels[vessel].ice) {
		warn(IssueCodes.stirWithoutIce, actionIndex);
	}

	emit({
		type: 'stir',
		vessel,
		intensity: action.intensity ?? Intensities.normal,
		seconds: action.seconds,
		revolutions: action.revolutions,
	});
};
