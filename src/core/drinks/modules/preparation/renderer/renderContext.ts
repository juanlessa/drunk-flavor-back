import { UsedItem } from '@/core/drinks/modules/preparation/entities/usedItem.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { preparationLocales } from '@/core/drinks/modules/preparation/locale';
import { ArticleKind, PreparationLocale } from '@/core/drinks/modules/preparation/locale/types';
import { Language } from '@/core/drinks/types/translations';
import { formatItem } from './formatItem';
import { createVesselNarrator, VesselNarrator } from './vesselNarrator';

/** What an action needs to write its event in one language. */
export type RenderContext = {
	language: Language;
	locale: PreparationLocale;
	narrator: VesselNarrator;
	/** A recipe item as the text mentions it ("a vodka", "os gomos de limão"). */
	formatItem(used: UsedItem, kind: ArticleKind): string;
};

export const createRenderContext = (plan: PreparationPlan, language: Language): RenderContext => {
	const locale = preparationLocales[language];
	return {
		language,
		locale,
		narrator: createVesselNarrator(locale, plan.servingGlass),
		formatItem: (used, kind) => formatItem(used, locale, kind),
	};
};
