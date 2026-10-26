import { Translations } from '@/core/drinks/types/translations';
import { UnitKind, UnitTranslation } from '@/core/drinks/entities/unit.entity';
import { DeepPartial } from '@/shared/types/utility.types';

export type CreateUnit = {
	translations: Translations<UnitTranslation>;
	symbol?: string;
	space_before_symbol?: boolean;
	allow_decimal: boolean;
	kind: UnitKind;
};

export type UpdateUnit = {
	id: string;
	symbol?: string | null;
} & DeepPartial<Omit<CreateUnit, 'symbol'>>;

export type DeleteUnit = {
	id: string;
};

export type GetUnit = {
	id: string;
};

export type FindUnitByName = DeepPartial<Translations<{ name: string }>>;
