import { CreateUnit } from '@/core/drinks/dtos/unit.dtos';
import { DeepPartial } from '@/shared/types/utility.types';

export const createUnitFactory = (unit?: DeepPartial<CreateUnit>): CreateUnit => ({
	translations: {
		en: {
			name: unit?.translations?.en?.name || 'milliliter',
			namePlural: unit?.translations?.en?.namePlural || 'milliliters',
		},
		pt: {
			name: unit?.translations?.pt?.name || 'mililitro',
			namePlural: unit?.translations?.pt?.namePlural || 'mililitros',
		},
	},
	...(unit?.symbol === undefined ? {} : { symbol: unit.symbol }),
	...(unit?.spaceBeforeSymbol === undefined ? {} : { spaceBeforeSymbol: unit.spaceBeforeSymbol }),
	allowDecimal: unit?.allowDecimal ?? true,
	kind: unit?.kind || 'volume',
});
