import { GarnishStyles } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { GarnishStyle } from '@/core/drinks/modules/preparation/types/technique.types';
import { Translations } from '@/core/drinks/types/translations';

/** `items` is the already written list of garnishes ("um gomo de limão e um ramo de hortelã"). */
export type GarnishSentence = (input: { style?: GarnishStyle; items: string }) => string;

export const garnishSentences: Translations<GarnishSentence> = {
	en: ({ style, items }) => {
		switch (style) {
			case GarnishStyles.express:
				return `Express ${items} over the drink to release the oils, then use as garnish`;
			case GarnishStyles.expressAndDiscard:
				return `Express ${items} over the drink to release the oils, then discard`;
			case GarnishStyles.flame:
				return `Flame ${items} over the drink to release the oils, then use as garnish`;
			case GarnishStyles.flameAndDiscard:
				return `Flame ${items} over the drink to release the oils, then discard`;
			case GarnishStyles.skewer:
				return `Garnish with ${items} on a skewer`;
			case GarnishStyles.rimPerch:
				return `Garnish with ${items} on the rim`;
			case GarnishStyles.float:
				return `Float ${items} on top`;
			case GarnishStyles.sprinkle:
				return `Sprinkle ${items} on top`;
			default:
				return `Garnish with ${items}`;
		}
	},
	pt: ({ style, items }) => {
		switch (style) {
			case GarnishStyles.express:
				return `Torça ${items} sobre a bebida para liberar os óleos e use para decorar`;
			case GarnishStyles.expressAndDiscard:
				return `Torça ${items} sobre a bebida para liberar os óleos e descarte`;
			case GarnishStyles.flame:
				return `Flambe ${items} sobre a bebida para liberar os óleos e use para decorar`;
			case GarnishStyles.flameAndDiscard:
				return `Flambe ${items} sobre a bebida para liberar os óleos e descarte`;
			case GarnishStyles.skewer:
				return `Decore com ${items} em um espeto`;
			case GarnishStyles.rimPerch:
				return `Decore com ${items} na borda`;
			case GarnishStyles.float:
				return `Coloque ${items} por cima`;
			case GarnishStyles.sprinkle:
				return `Polvilhe ${items} por cima`;
			default:
				return `Decore com ${items}`;
		}
	},
};
