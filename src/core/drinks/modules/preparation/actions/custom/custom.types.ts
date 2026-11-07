import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import { VesselRole } from '@/core/drinks/modules/preparation/types/vessel.types';
import { Translations } from '@/core/drinks/types/translations';

/**
 * Free text in each language, for anything the other actions cannot express yet. `items` declares the
 * recipe lines the text consumes (so they count as used) and `into` says which vessel they end up in.
 */
export type CustomAction = {
	type: 'custom';
	text: Translations<string>;
	items?: RecipeItemRef[];
	into?: VesselRole;
};

export type CustomEvent = { type: 'custom'; text: Translations<string> };
