import { z } from 'zod/v4';
import { UnitKind, UnitTranslation } from '@/core/drinks/entities/unit.entity';
import { Translations } from '@/core/drinks/types/translations';
import { Actor } from '@/shared/accessControl/actor.types';

import { updateUnitSchema } from './updateUnit.schema';

export type UpdateUnitReqBody = z.infer<typeof updateUnitSchema>;
export type UpdateUnitDTO = {
	id: string;
	translations: Translations<UnitTranslation>;
	symbol?: string | null;
	spaceBeforeSymbol?: boolean;
	allowDecimal: boolean;
	kind: UnitKind;
	/** Omitted keeps the current value. */
	useIngredientName?: boolean;
	actor: Actor;
};
