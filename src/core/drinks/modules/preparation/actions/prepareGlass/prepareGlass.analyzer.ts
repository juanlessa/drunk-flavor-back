import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { IssueCodes } from '@/core/drinks/modules/preparation/constants/issue.constants';
import {
	GlassPreparationModes,
	RecipeLists,
	RimCoverages,
} from '@/core/drinks/modules/preparation/constants/technique.constants';
import { MixingVessels } from '@/core/drinks/modules/preparation/constants/vessel.constants';

export const analyzePrepareGlass: ActionDefinition<'prepare_glass'>['analyze'] = (action, context, actionIndex) => {
	const { vessels, emit, warn, useItem } = context;

	if (vessels[MixingVessels.servingGlass].items > 0) {
		warn(IssueCodes.glassPreparedLate, actionIndex);
	}

	switch (action.mode) {
		case GlassPreparationModes.chill:
			emit({ type: 'prepare_glass', mode: GlassPreparationModes.chill });
			break;
		case GlassPreparationModes.warm:
			emit({ type: 'prepare_glass', mode: GlassPreparationModes.warm });
			break;
		case GlassPreparationModes.rinse: {
			const item = useItem(action.item, [RecipeLists.ingredients], actionIndex);
			if (item) emit({ type: 'prepare_glass', mode: GlassPreparationModes.rinse, item });
			break;
		}
		case GlassPreparationModes.rim: {
			const item = useItem(action.item, [RecipeLists.garnishes, RecipeLists.ingredients], actionIndex);
			if (item) {
				emit({
					type: 'prepare_glass',
					mode: GlassPreparationModes.rim,
					item,
					half: action.coverage === RimCoverages.half,
				});
			}
			break;
		}
	}
};
