import { z } from 'zod/v4';
import { UnitKind, UnitTranslation } from '@/core/drinks/entities/unit.entity';
import { Translations } from '@/core/drinks/types/translations';
import { updateUnitSchema } from './updateUnit.schema';

export type UpdateUnitReqBody = z.infer<typeof updateUnitSchema>;
export type UpdateUnitDTO = {
	id: string;
	translations: Translations<UnitTranslation>;
	symbol?: string | null;
	spaceBeforeSymbol?: boolean;
	allowDecimal: boolean;
	kind: UnitKind;
};
