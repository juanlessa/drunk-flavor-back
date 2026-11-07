import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { toSentence } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { garnishSentences } from './garnish.locale';

export const renderGarnish: ActionDefinition<'garnish'>['render'] = (event, { language, locale, formatItem }) =>
	toSentence(
		garnishSentences[language]({
			style: event.style,
			items: locale.list(event.items.map((item) => formatItem(item, 'indefinite'))),
		}),
	);

/** Two garnish actions in the same style in a row read better as one sentence. */
export const mergeGarnish: NonNullable<ActionDefinition<'garnish'>['merge']> = (previous, next) =>
	previous.style === next.style ? { ...previous, items: [...previous.items, ...next.items] } : undefined;
