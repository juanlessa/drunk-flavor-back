import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { MixingVessels, VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { strainSentences } from './strain.locale';

export const renderStrain: ActionDefinition<'strain'>['render'] = (event, { language, narrator }) => {
	const sentences = strainSentences[language];

	// Straining always names where the mixture goes, and the text follows it there.
	if (event.destination === VesselRoles.mixing) {
		const clause = sentences.backToMixing(narrator.mention(event.vessel, 'to'));
		narrator.focusOn(event.vessel);
		return toSentence(clause);
	}

	const clause = sentences.toServing({
		kind: event.kind,
		glass: (form) => narrator.mention(MixingVessels.servingGlass, form),
		overIce: event.overIce,
	});
	narrator.focusOn(MixingVessels.servingGlass);
	return toSentence(clause);
};
