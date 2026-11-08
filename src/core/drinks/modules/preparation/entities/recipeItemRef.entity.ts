import { RecipeList } from '@/core/drinks/modules/preparation/types/technique.types';

/** Points at one recipe line: the ingredient plus the unit it is measured in, in one of the drink's lists. */
export type RecipeItemRef = {
	list: RecipeList;
	ingredientId: string;
	unitId?: string;
	/**
	 * When true the text names the item through its unit ("os gomos de limão") instead of by name
	 * alone ("o limão"). Defaults to false. Ignored, with a warning, when the line has no unit.
	 */
	withUnit?: boolean;
};
