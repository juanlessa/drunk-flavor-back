import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { RecipeLists } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels } from '@/core/drinks/modules/preparation/constants/vessel.constants';

export const analyzeGarnish: ActionDefinition<'garnish'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, error, warn, useItem } = context;

	if (action.items.length === 0) {
		error(IssueCodes.emptyGarnish, actionIndex);
	}
	if (vessels[MixingVessels.servingGlass].items === 0) {
		warn(IssueCodes.garnishOnEmptyGlass, actionIndex);
	}

	const items = action.items.flatMap((ref) => useItem(ref, [RecipeLists.garnishes], actionIndex) ?? []);
	if (items.length > 0) emit({ type: 'garnish', items, style: action.style });
};
