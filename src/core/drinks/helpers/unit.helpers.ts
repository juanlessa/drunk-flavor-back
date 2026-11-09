import { UnitKinds } from '@/core/drinks/constants/unit.constants';
import { BadRequestError } from '@/shared/error/error.lib';
import type { LocaleKey } from '@/shared/types/locale.types';

type UnitIngredientNameIssue = {
	message: Extract<LocaleKey, `apiResponses.units.${string}`>;
	field: 'kind' | 'symbol';
};

/**
 * The problem with a unit that is written with the name of the ingredient, if any: such a unit must be
 * a `count` unit and cannot have a symbol, because the quantity is followed by the ingredient name.
 * A `null` symbol means no symbol. Any other unit has nothing to check.
 *
 * It is shared by the request schemas and the domain so both apply the very same rule.
 */
export const getUnitIngredientNameIssue = (unit: {
	useIngredientName?: boolean;
	kind?: string;
	symbol?: string | null;
}): UnitIngredientNameIssue | undefined => {
	if (unit.useIngredientName !== true) return undefined;
	if (unit.kind !== UnitKinds.count) {
		return { message: 'apiResponses.units.ingredientNameRequiresCountKind', field: 'kind' };
	}
	if (typeof unit.symbol === 'string') {
		return { message: 'apiResponses.units.ingredientNameNotAllowedWithSymbol', field: 'symbol' };
	}
	return undefined;
};

/** Domain invariant of a unit, enforced whoever builds it (API, seed, scripts). */
export const assertUnitIngredientName = (
	unit: { useIngredientName?: boolean; kind?: string; symbol?: string | null },
	path: string,
): void => {
	const issue = getUnitIngredientNameIssue(unit);
	if (issue) throw new BadRequestError(issue.message, { path });
};
