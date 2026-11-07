import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { PreparationRecipeItem } from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { UsedItem } from '@/core/drinks/modules/preparation/entities/usedItem.entity';
import { getItemQuantity, getItemUnit } from '@/core/drinks/modules/preparation/helpers/recipe.helpers';
import { words } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { ArticleKind, PreparationLocale } from '@/core/drinks/modules/preparation/locale/types';

// Quantities are never repeated in the method: the drink already lists them in its ingredients.

/** Seeded names are capitalized ("Silver rum"); mid-sentence they are lowercased, except branded products. */
const getItemName = ({ ingredient }: PreparationRecipeItem, locale: PreparationLocale): string => {
	const { name } = ingredient.translations[locale.code];
	return ingredient.kind === IngredientKinds.branded ? name : name.toLowerCase();
};

/** The unit and quantity of a line, when it has both. */
const getMeasure = (item: PreparationRecipeItem) => {
	const unit = getItemUnit(item);
	const quantity = getItemQuantity(item);
	return unit && quantity !== undefined ? { unit, quantity } : undefined;
};

/**
 * Writes a recipe item the way an action mentions it.
 *
 * By default the item is its name with an article ("a vodka"). When the action asks for the unit
 * ("withUnit") the unit takes over: it agrees in number with the quantity and brings its own gender
 * ("o gomo de limão", "os gomos de limão"). The quantity itself is not repeated.
 *
 * An indefinite article only makes sense for a unit ("um gomo de limão"); a bare name stays bare
 * ("com hortelã").
 */
export const formatItem = ({ item, withUnit }: UsedItem, locale: PreparationLocale, kind: ArticleKind): string => {
	const name = getItemName(item, locale);
	const measure = withUnit ? getMeasure(item) : undefined;

	if (!measure) {
		const articleKind = kind === 'indefinite' ? 'none' : kind;
		const gender = item.ingredient.translations[locale.code].gender;
		return words(locale.article({ gender, plural: false, kind: articleKind }), name);
	}

	const { unit, quantity } = measure;
	const translation = unit.translations[locale.code];
	const plural = new Intl.PluralRules(locale.intl).select(quantity) !== 'one';
	const unitName = plural ? translation.namePlural : translation.name;
	const article = locale.article({ gender: translation.gender, plural, kind, following: unitName });
	return words(article, unitName, locale.of, name);
};
