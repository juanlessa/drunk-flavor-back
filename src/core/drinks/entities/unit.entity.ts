import { UnitKinds } from '@/core/drinks/constants/unit.constants';
import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';
import { Gender } from '@/shared/types/gender.types';

export type UnitKind = (typeof UnitKinds)[keyof typeof UnitKinds];

export type UnitTranslation = {
	name: string;
	namePlural: string;
	/** Grammatical gender of the name in this language. Not every language needs it (e.g. English). */
	gender?: Gender;
};

export type Unit = EntityMetadata & {
	translations: Translations<UnitTranslation>;
	symbol?: string;
	spaceBeforeSymbol?: boolean;
	allowDecimal: boolean;
	kind: UnitKind;
	useIngredientName?: boolean;
};
