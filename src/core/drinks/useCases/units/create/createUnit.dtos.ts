import { UnitKind, UnitTranslation } from '@/core/drinks/entities/unit.entity';
import { Translations } from '@/core/drinks/types/translations';
import { z } from 'zod/v4';
import { createUnitSchema } from './createUnit.schema';

export type CreateUnitReqBody = z.infer<typeof createUnitSchema>;

export type CreateUnitDTO = {
	translations: Translations<UnitTranslation>;
	symbol?: string;
	space_before_symbol?: boolean;
	allow_decimal: boolean;
	kind: UnitKind;
};
