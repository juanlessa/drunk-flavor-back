import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';

export const UnitKinds = {
	volume: 'volume',
	mass: 'mass',
	count: 'count',
	informal: 'informal',
} as const;

export type UnitKind = (typeof UnitKinds)[keyof typeof UnitKinds];

export type UnitTranslation = {
	name: string;
	namePlural: string;
};

export type Unit = EntityMetadata & {
	translations: Translations<UnitTranslation>;
	symbol?: string;
	spaceBeforeSymbol?: boolean;
	allowDecimal: boolean;
	kind: UnitKind;
};
