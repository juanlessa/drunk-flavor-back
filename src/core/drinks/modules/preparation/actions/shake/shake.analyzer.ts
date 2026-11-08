import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { Intensities } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels, VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';

export const analyzeShake: ActionDefinition<'shake'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, shakes, emit, error, resolveVessel } = context;

	const vessel = resolveVessel(VesselRoles.mixing);
	if (vessel !== MixingVessels.shaker) {
		error(IssueCodes.shakeRequiresShaker, actionIndex, { vessel });
	}
	if (vessels[vessel].items === 0) {
		error(IssueCodes.nothingToShake, actionIndex);
	}

	// A shake without ice in the vessel is a dry shake.
	const dry = !vessels[vessel].ice;
	if (dry) shakes.dry += 1;
	else shakes.wet += 1;

	emit({ type: 'shake', dry, intensity: action.intensity ?? Intensities.normal, seconds: action.seconds });
};
