import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { Translations } from '@/core/drinks/types/translations';

export enum UnitKindEnum {
	volume = 'volume',
	mass = 'mass',
	count = 'count',
	informal = 'informal',
}

export type UnitKind = `${UnitKindEnum}`;

export type UnitTranslation = {
	name: string;
	name_plural: string;
};

export type Unit = DatabaseCommonInfo & {
	translations: Translations<UnitTranslation>;
	symbol?: string;
	space_before_symbol?: boolean;
	allow_decimal: boolean;
	kind: UnitKind;
};
