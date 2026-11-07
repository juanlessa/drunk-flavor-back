import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import { UsedItem } from '@/core/drinks/modules/preparation/entities/usedItem.entity';

/** Tops the serving glass up with an ingredient. */
export type TopAction = { type: 'top'; item: RecipeItemRef };

export type TopEvent = { type: 'top'; item: UsedItem };
