import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { addIceSentences } from './addIce.locale';

export const renderAddIce: ActionDefinition<'add_ice'>['render'] = (event, { language, locale, narrator }) =>
	toSentence(addIceSentences[language](locale.ice[event.kind]), narrator.locate(event.vessel));
