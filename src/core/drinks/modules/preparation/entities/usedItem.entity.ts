import { PreparationRecipeItem } from './preparationDrink.entity';

/** A recipe line used by an action, plus how the action wants it written. */
export type UsedItem = { item: PreparationRecipeItem; withUnit: boolean };
