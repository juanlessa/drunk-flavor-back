import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { actionDefinitions } from '@/core/drinks/modules/preparation/actions';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { RecipeLists } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels, VesselRoles } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import {
	PreparationAction,
	PreparationActionType,
} from '@/core/drinks/modules/preparation/entities/preparationAction.entity';
import { PreparationDrink } from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { PreparationEvent } from '@/core/drinks/modules/preparation/entities/preparationEvent.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { PreparationIssue } from '@/core/drinks/modules/preparation/entities/preparationResult.entity';
import { AnalysisContext, createAnalysisContext } from './analysisContext';

/** Picks the definition of an action. Each one is typed for its own action; the registry is exhaustive. */
const analyzeAction = (action: PreparationAction, context: AnalysisContext, actionIndex: number): void => {
	const definition = actionDefinitions[action.type] as ActionDefinition<PreparationActionType>;
	definition.analyze(action, context, actionIndex);
};

/** Checks that need the whole plan: nothing was left unused or unserved. */
const checkPlanAsAWhole = ({ ingredients, garnishes }: PreparationDrink, context: AnalysisContext): void => {
	const { vessels, shakes, warn, error, isUsed, resolveVessel } = context;

	if (shakes.dry > 0 && shakes.wet === 0) {
		warn(IssueCodes.dryShakeWithoutWetShake);
	}

	ingredients.forEach((item) => {
		if (!item.optional && !isUsed(RecipeLists.ingredients, item)) {
			error(IssueCodes.unusedRequiredIngredient, undefined, { ingredientId: item.ingredient.id });
		}
	});
	garnishes.forEach((item) => {
		if (!isUsed(RecipeLists.garnishes, item)) {
			warn(IssueCodes.unusedGarnish, undefined, { ingredientId: item.ingredient.id });
		}
	});

	if (vessels[MixingVessels.servingGlass].items === 0) {
		error(IssueCodes.nothingServed);
	}
	const mixing = resolveVessel(VesselRoles.mixing);
	if (mixing !== MixingVessels.servingGlass && vessels[mixing].items > 0) {
		warn(IssueCodes.contentsLeftInMixingVessel, undefined, { vessel: mixing });
	}
};

/**
 * Walks the plan action by action, simulating what each vessel holds. Returns what happens
 * (for the renderer) and every problem found along the way.
 */
export const analyzePlan = (
	drink: PreparationDrink,
	plan: PreparationPlan,
): { events: PreparationEvent[]; issues: PreparationIssue[] } => {
	const context = createAnalysisContext(drink, plan);

	if (plan.actions.length === 0) {
		context.error(IssueCodes.emptyPlan);
	}
	plan.actions.forEach((action, actionIndex) => analyzeAction(action, context, actionIndex));
	checkPlanAsAWhole(drink, context);

	return { events: context.events, issues: context.issues };
};
