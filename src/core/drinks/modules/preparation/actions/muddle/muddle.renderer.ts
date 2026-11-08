import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { muddleSentences } from './muddle.locale';

export const renderMuddle: ActionDefinition<'muddle'>['render'] = (event, { language, locale, narrator }) =>
	toSentence(
		muddleSentences[language]({ adverb: locale.muddleAdverbs[event.intensity] }),
		narrator.locate(event.vessel),
	);
