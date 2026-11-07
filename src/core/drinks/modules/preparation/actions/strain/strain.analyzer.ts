import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { StrainKinds } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels, VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';

export const analyzeStrain: ActionDefinition<'strain'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, error, warn, resolveVessel } = context;

	const from = resolveVessel(VesselRoles.mixing);
	const source = vessels[from];
	const serving = vessels[MixingVessels.servingGlass];

	if (source.items === 0) {
		error(IssueCodes.nothingToStrain, actionIndex);
		return;
	}

	// Straining the ice out and returning the liquid to the mixing vessel (reverse dry shake).
	if (action.to === VesselRoles.mixing) {
		if (!source.ice) {
			warn(IssueCodes.strainWithoutIce, actionIndex);
		}
		source.ice = false;
		emit({ type: 'strain', destination: VesselRoles.mixing, vessel: from });
		return;
	}

	if (from === MixingVessels.servingGlass) {
		error(IssueCodes.strainSameVessel, actionIndex);
		return;
	}

	if (action.overIce && !serving.ice) {
		warn(IssueCodes.strainOverIceWithoutIce, actionIndex);
	}
	if (action.kind === StrainKinds.none && source.ice) {
		warn(IssueCodes.icePouredIntoGlass, actionIndex);
		serving.ice = true;
	}

	serving.items += source.items;
	source.items = 0;
	source.ice = false;
	emit({
		type: 'strain',
		destination: VesselRoles.serving,
		kind: action.kind,
		overIce: action.overIce ?? false,
	});
};
