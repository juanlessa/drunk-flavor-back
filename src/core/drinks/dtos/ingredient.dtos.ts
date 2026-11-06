import { Category } from '@/core/drinks/entities/category.entity';
import { IngredientKind, IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

export type CreateIngredient = {
	translations: Translations<IngredientTranslation>;
	category: Category;
	unit: Unit;
	/** Defaults to `generic` when omitted. */
	kind?: IngredientKind;
	brand?: string;
};

/** On update, a `null` description removes the current one. */
export type UpdateIngredientTranslation = {
	name: string;
	description?: string | null;
};

export type UpdateIngredientData = {
	/** Omitted keeps the current brand; `null` removes it. */
	brand?: string | null;
} & DeepPartial<{
	translations: Translations<UpdateIngredientTranslation>;
	category: Category;
	unit: Unit;
	kind: IngredientKind;
}>;

export type UpdateIngredient = { id: string } & UpdateIngredientData;

export type DeleteIngredient = {
	id: string;
};

export type GetIngredient = {
	id: string;
};

export type FindIngredientByName = DeepPartial<Translations<{ name: string }>>;
