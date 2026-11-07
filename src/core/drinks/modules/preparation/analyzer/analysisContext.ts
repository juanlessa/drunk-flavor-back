import { IssueCodes, IssueSeverities } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { RecipeLists } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels, VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import {
	PreparationDrink,
	PreparationRecipeItem,
} from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { PreparationEvent } from '@/core/drinks/modules/preparation/entities/preparationEvent.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { PreparationIssue } from '@/core/drinks/modules/preparation/entities/preparationResult.entity';
import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import { UsedItem } from '@/core/drinks/modules/preparation/entities/usedItem.entity';
import {
	getItemKey,
	getItemUnit,
	getRecipeItemKey,
	getUsageKey,
} from '@/core/drinks/modules/preparation/helpers/recipe.helpers';
import { IssueCode, IssueParams } from '@/core/drinks/modules/preparation/types/issue.types';
import { RecipeList } from '@/core/drinks/modules/preparation/types/technique.types';
import { PhysicalVessel, VesselRole } from '@/core/drinks/modules/preparation/types/vessel.types';

/** What the simulation knows about a vessel at a point of the plan. */
export type VesselState = { items: number; ice: boolean };

/**
 * Everything the action analyzers share while walking a plan: the simulated state of the vessels,
 * the recipe lines already used, and the collected issues and events.
 */
export type AnalysisContext = {
	readonly plan: PreparationPlan;
	readonly events: PreparationEvent[];
	readonly issues: PreparationIssue[];
	readonly vessels: Record<PhysicalVessel, VesselState>;
	/** How many shakes happened without and with ice. */
	readonly shakes: { dry: number; wet: number };
	emit(event: PreparationEvent): void;
	error(code: IssueCode, actionIndex?: number, params?: IssueParams): void;
	warn(code: IssueCode, actionIndex?: number, params?: IssueParams): void;
	/** The physical vessel behind a role: `mixing` depends on how the drink is prepared. */
	resolveVessel(role: VesselRole): PhysicalVessel;
	/**
	 * Resolves a reference, enforcing the lists the action may take from and that each line is used
	 * only once. Reports the problem and returns undefined when the reference is not usable.
	 */
	useItem(ref: RecipeItemRef, allowed: RecipeList[], actionIndex: number): UsedItem | undefined;
	isUsed(list: RecipeList, item: PreparationRecipeItem): boolean;
};

export const createAnalysisContext = (
	{ ingredients, garnishes }: PreparationDrink,
	plan: PreparationPlan,
): AnalysisContext => {
	const events: PreparationEvent[] = [];
	const issues: PreparationIssue[] = [];
	const lists: Record<RecipeList, Map<string, PreparationRecipeItem>> = {
		[RecipeLists.ingredients]: new Map(ingredients.map((item) => [getItemKey(item), item])),
		[RecipeLists.garnishes]: new Map(garnishes.map((item) => [getItemKey(item), item])),
	};
	const used = new Set<string>();

	const report =
		(severity: PreparationIssue['severity']) =>
		(code: IssueCode, actionIndex?: number, params?: IssueParams): void => {
			issues.push({
				severity,
				code,
				...(actionIndex === undefined ? {} : { actionIndex }),
				...(params === undefined ? {} : { params }),
			});
		};
	const error = report(IssueSeverities.error);
	const warn = report(IssueSeverities.warning);

	return {
		plan,
		events,
		issues,
		vessels: {
			[MixingVessels.shaker]: { items: 0, ice: false },
			[MixingVessels.mixingGlass]: { items: 0, ice: false },
			[MixingVessels.pitcher]: { items: 0, ice: false },
			[MixingVessels.servingGlass]: { items: 0, ice: false },
		},
		shakes: { dry: 0, wet: 0 },
		emit: (event) => {
			events.push(event);
		},
		error,
		warn,

		resolveVessel: (role) => (role === VesselRoles.mixing ? plan.mixingVessel : MixingVessels.servingGlass),

		useItem: (ref, allowed, actionIndex) => {
			if (!allowed.includes(ref.list)) {
				error(IssueCodes.invalidItemList, actionIndex, { list: ref.list });
				return undefined;
			}

			const key = getRecipeItemKey(ref.ingredientId, ref.unitId);
			const item = lists[ref.list].get(key);
			if (!item) {
				error(IssueCodes.unknownItem, actionIndex, { list: ref.list, ingredientId: ref.ingredientId });
				return undefined;
			}

			const usageKey = getUsageKey(ref.list, key);
			if (used.has(usageKey)) {
				error(IssueCodes.duplicateItemUse, actionIndex, { ingredientId: ref.ingredientId });
				return undefined;
			}
			used.add(usageKey);

			const hasUnit = getItemUnit(item) !== undefined;
			if (ref.withUnit && !hasUnit) {
				warn(IssueCodes.withUnitWithoutUnit, actionIndex, { ingredientId: ref.ingredientId });
			}
			return { item, withUnit: (ref.withUnit ?? false) && hasUnit };
		},

		isUsed: (list, item) => used.has(getUsageKey(list, getItemKey(item))),
	};
};
