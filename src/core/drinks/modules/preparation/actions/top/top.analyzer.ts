import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import { RecipeLists } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels } from '@/core/drinks/modules/preparation/constants/vessel.constants';

export const analyzeTop: ActionDefinition<'top'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, warn, useItem } = context;
	const serving = vessels[MixingVessels.servingGlass];

	const item = useItem(action.item, [RecipeLists.ingredients], actionIndex);
	if (serving.items === 0) {
		warn(IssueCodes.topOnEmptyGlass, actionIndex);
	}
	serving.items += 1;
	if (item) emit({ type: 'top', item });
};
