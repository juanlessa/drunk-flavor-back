import { GlassPreparationModes } from '@/core/drinks/modules/preparation/constants/technique.constants';
import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import { UsedItem } from '@/core/drinks/modules/preparation/entities/usedItem.entity';
import { RimCoverage } from '@/core/drinks/modules/preparation/types/technique.types';

/** Prepares the serving glass: chill it, warm it, rinse it with a liquid or rim it. */
export type PrepareGlassAction =
	| { type: 'prepare_glass'; mode: typeof GlassPreparationModes.chill | typeof GlassPreparationModes.warm }
	| { type: 'prepare_glass'; mode: typeof GlassPreparationModes.rinse; item: RecipeItemRef }
	| {
			type: 'prepare_glass';
			mode: typeof GlassPreparationModes.rim;
			item: RecipeItemRef;
			coverage?: RimCoverage;
	  };

export type PrepareGlassEvent =
	| { type: 'prepare_glass'; mode: typeof GlassPreparationModes.chill | typeof GlassPreparationModes.warm }
	| { type: 'prepare_glass'; mode: typeof GlassPreparationModes.rinse; item: UsedItem }
	| { type: 'prepare_glass'; mode: typeof GlassPreparationModes.rim; item: UsedItem; half: boolean };
