import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { addSentences } from './add.locale';

export const renderAdd: ActionDefinition<'add'>['render'] = (event, { language, locale, narrator, formatItem }) =>
	toSentence(
		addSentences[language](locale.list(event.items.map((item) => formatItem(item, 'definite')))),
		narrator.locate(event.vessel),
	);

/** Two adds to the same vessel in a row read better as one sentence. */
export const mergeAdd: NonNullable<ActionDefinition<'add'>['merge']> = (previous, next) =>
	previous.vessel === next.vessel ? { ...previous, items: [...previous.items, ...next.items] } : undefined;
