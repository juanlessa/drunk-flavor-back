import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { stirSentences } from './stir.locale';

export const renderStir: ActionDefinition<'stir'>['render'] = (event, { language, locale, narrator }) =>
	toSentence(
		stirSentences[language]({
			adverb: locale.adverbs[event.intensity],
			duration: locale.duration({ seconds: event.seconds, revolutions: event.revolutions }),
		}),
		narrator.locate(event.vessel),
	);
