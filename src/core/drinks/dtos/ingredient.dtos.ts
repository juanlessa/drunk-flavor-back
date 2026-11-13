import { Category } from '@/core/drinks/entities/category.entity';
import { IngredientKind, IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

export type IngredientData = {
	translations: Translations<IngredientTranslation>;
	category: Category;
	/** Allowed units in display order; empty means not measurable. */
	units: Unit[];
	/** Defaults to `generic` when omitted. */
	kind?: IngredientKind;
	brand?: string;
};

/** `createdBy` is set once, when the ingredient is created, and is never part of an update. */
export type CreateIngredient = IngredientData & { createdBy: string };

/** On update, a `null` description or plural name removes the current one. */
export type UpdateIngredientTranslation = {
	name: string;
	namePlural?: string | null;
	description?: string | null;
};

export type UpdateIngredientData = {
	/** Omitted keeps the current brand; `null` removes it. */
	brand?: string | null;
} & DeepPartial<{
	translations: Translations<UpdateIngredientTranslation>;
	category: Category;
	units: Unit[];
	kind: IngredientKind;
}>;

export type UpdateIngredient = { id: string; updatedBy: string } & UpdateIngredientData;

export type FindIngredientByName = DeepPartial<Translations<{ name: string }>>;
