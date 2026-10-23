import { Category } from '@/core/drinks/entities/category.entity';
import { IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

export type CreateIngredient = {
	translations: Translations<IngredientTranslation>;
	category: Category;
	unit: Unit;
};

export type UpdateIngredient = { id: string } & DeepPartial<{
	translations: Translations<IngredientTranslation>;
	category: Category;
	unit: Unit;
}>;

export type DeleteIngredient = {
	id: string;
};

export type GetIngredient = {
	id: string;
};

export type FindIngredientByName = DeepPartial<Translations<{ name: string }>>;
