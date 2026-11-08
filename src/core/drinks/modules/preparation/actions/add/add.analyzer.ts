import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { RecipeLists } from '@/core/drinks/modules/preparation/constants/technique.constants';

export const analyzeAdd: ActionDefinition<'add'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, error, resolveVessel, useItem } = context;

	if (action.items.length === 0) {
		error(IssueCodes.emptyAdd, actionIndex);
	}

	const vessel = resolveVessel(action.target);
	const items = action.items.flatMap((ref) => useItem(ref, [RecipeLists.ingredients], actionIndex) ?? []);
	vessels[vessel].items += items.length;
	if (items.length > 0) emit({ type: 'add', vessel, items });
};
