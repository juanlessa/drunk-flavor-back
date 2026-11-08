import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { RecipeLists } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { LANGUAGES } from '@/core/drinks/modules/preparation/helpers/translations.helpers';

export const analyzeCustom: ActionDefinition<'custom'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, error, resolveVessel, useItem } = context;

	const hasAllTexts = LANGUAGES.every((language) => action.text[language].trim());
	if (!hasAllTexts) {
		error(IssueCodes.customTextMissing, actionIndex);
		return;
	}

	// The text consumes the lines it declares, so they count as used and as put in a vessel.
	const items = (action.items ?? []).flatMap(
		(ref) => useItem(ref, [RecipeLists.ingredients, RecipeLists.garnishes], actionIndex) ?? [],
	);
	if (action.into) vessels[resolveVessel(action.into)].items += items.length;

	emit({ type: 'custom', text: action.text });
};
