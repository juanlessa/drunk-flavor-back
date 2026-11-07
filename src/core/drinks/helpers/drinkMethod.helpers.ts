import { DrinkTranslationInput } from '@/core/drinks/dtos/drink.dtos';
import { DrinkTranslation } from '@/core/drinks/entities/drink.entity';
import { toPreparationFieldError } from '@/core/drinks/mappers/preparationIssue.mappers';
import { buildMethod, PreparationDrink, PreparationPlan } from '@/core/drinks/modules/preparation';
import { Language, Languages, Translations } from '@/core/drinks/types/translations';
import { BadRequestError, FieldValidationError } from '@/shared/error/error.lib';

/**
 * Settles the method of a drink. With a preparation plan the method of every language is written from it, and
 * the plan is kept to be stored. Without one, the methods sent by hand are used as they are and there is no plan.
 *
 * The request schema already requires the methods when there is no plan, so a missing one here is a bug of the
 * caller and is reported as a bad request instead of being stored empty.
 */
export const resolveDrinkMethod = (
	{ translations, preparation }: { translations: Translations<DrinkTranslationInput>; preparation?: PreparationPlan },
	recipe: PreparationDrink,
	path: string,
): { translations: Translations<DrinkTranslation>; preparation?: PreparationPlan } => {
	if (preparation) {
		const result = buildMethod(recipe, preparation);
		if (!result.ok) throw new FieldValidationError(result.errors.map(toPreparationFieldError), { path });
		return {
			translations: mapTranslations(translations, (language, { name }) => ({
				name,
				method: result.method[language],
			})),
			preparation,
		};
	}
	return {
		translations: mapTranslations(translations, (_language, { name, method }) => {
			if (method === undefined) throw new BadRequestError('apiResponses.drinks.requiredMethod', { path });
			return { name, method };
		}),
	};
};

const mapTranslations = (
	translations: Translations<DrinkTranslationInput>,
	map: (language: Language, translation: DrinkTranslationInput) => DrinkTranslation,
): Translations<DrinkTranslation> =>
	(Object.values(Languages) as Language[]).reduce(
		(accumulator, language) => ({ ...accumulator, [language]: map(language, translations[language]) }),
		{} as Translations<DrinkTranslation>,
	);
