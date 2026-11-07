import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import { UsedItem } from '@/core/drinks/modules/preparation/entities/usedItem.entity';
import { GarnishStyle } from '@/core/drinks/modules/preparation/types/technique.types';

/** Finishes the drink with garnishes, in a given style. */
export type GarnishAction = { type: 'garnish'; items: RecipeItemRef[]; style?: GarnishStyle };

export type GarnishEvent = { type: 'garnish'; items: UsedItem[]; style?: GarnishStyle };
