import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { GlassPreparationModes } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { prepareGlassSentences } from './prepareGlass.locale';

export const renderPrepareGlass: ActionDefinition<'prepare_glass'>['render'] = (
	event,
	{ language, narrator, formatItem },
) => {
	const sentences = prepareGlassSentences[language];
	const servingGlass = MixingVessels.servingGlass;

	switch (event.mode) {
		case GlassPreparationModes.chill:
			return toSentence(sentences.chill(narrator.mention(servingGlass, 'the')));
		case GlassPreparationModes.warm:
			return toSentence(sentences.warm(narrator.mention(servingGlass, 'the')));
		case GlassPreparationModes.rinse:
			return toSentence(
				sentences.rinse((form) => narrator.mention(servingGlass, form), formatItem(event.item, 'definite')),
			);
		case GlassPreparationModes.rim:
			return toSentence(
				sentences.rim({
					glass: (form) => narrator.mention(servingGlass, form),
					item: formatItem(event.item, 'definite'),
					half: event.half,
				}),
			);
	}
};
