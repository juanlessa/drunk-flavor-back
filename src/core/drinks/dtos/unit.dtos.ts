import { UnitKind, UnitTranslation } from '@/core/drinks/entities/unit.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

export type UnitData = {
	translations: Translations<UnitTranslation>;
	symbol?: string;
	spaceBeforeSymbol?: boolean;
	allowDecimal: boolean;
	kind: UnitKind;
	useIngredientName?: boolean;
};

/** `createdBy` is set once, when the unit is created, and is never part of an update. */
export type CreateUnit = UnitData & { createdBy: string };

export type UpdateUnit = { id: string; updatedBy: string; symbol?: string | null } & DeepPartial<
	Omit<UnitData, 'symbol'>
>;
export type DeleteUnit = { id: string };
export type GetUnit = { id: string };
export type FindUnitByName = DeepPartial<Translations<{ name: string }>>;
