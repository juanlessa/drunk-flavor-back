import { analyzePlan } from '@/core/drinks/modules/preparation/analyzer/analyzePlan';
import { IssueSeverities } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { PreparationDrink } from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { BuildMethodResult } from '@/core/drinks/modules/preparation/entities/preparationResult.entity';
import { buildTranslations } from '@/core/drinks/modules/preparation/helpers/translations.helpers';
import { renderSentences } from '@/core/drinks/modules/preparation/renderer/renderSentences';

/**
 * Validates a plan against the drink's recipe and writes the method in every language.
 *
 * It is pure: no I/O, no throwing for invalid plans. Errors (physically impossible or incomplete plans)
 * block the output; warnings (unusual sequences) are returned next to it.
 *
 * `drink` is any object with the recipe lines the module reads (see `PreparationDrink`); a full `Drink`
 * is accepted as is.
 */
export const buildMethod = (drink: PreparationDrink, plan: PreparationPlan): BuildMethodResult => {
	const { events, issues } = analyzePlan(drink, plan);
	const errors = issues.filter((issue) => issue.severity === IssueSeverities.error);
	const warnings = issues.filter((issue) => issue.severity === IssueSeverities.warning);

	if (errors.length > 0) return { ok: false, errors, warnings };

	const sentences = buildTranslations((language) => renderSentences(events, plan, language));
	const method = buildTranslations((language) => sentences[language].join(' '));

	return { ok: true, method, sentences, warnings };
};
