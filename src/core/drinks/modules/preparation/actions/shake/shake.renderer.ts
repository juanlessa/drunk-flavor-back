import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { shakeSentences } from './shake.locale';

export const renderShake: ActionDefinition<'shake'>['render'] = (event, { language, locale }) =>
	toSentence(
		shakeSentences[language]({
			adverb: locale.adverbs[event.intensity],
			dry: event.dry,
			duration: locale.duration({ seconds: event.seconds }),
		}),
	);
