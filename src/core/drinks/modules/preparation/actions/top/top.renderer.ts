import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { MixingVessels } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { topSentences } from './top.locale';

export const renderTop: ActionDefinition<'top'>['render'] = (event, { language, narrator, formatItem }) => {
	narrator.focusOn(MixingVessels.servingGlass);
	return toSentence(topSentences[language](formatItem(event.item, 'definite')));
};
