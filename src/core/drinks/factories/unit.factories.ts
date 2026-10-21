import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUnitReqBody } from '../useCases/units/create/createUnit.dtos';

export const createUnitFactory = (unit?: DeepPartial<CreateUnitReqBody>): CreateUnitReqBody => ({
	translations: {
		en: {
			name: unit?.translations?.en?.name || 'milliliter',
			name_plural: unit?.translations?.en?.name_plural || 'milliliters',
		},
		pt: {
			name: unit?.translations?.pt?.name || 'mililitro',
			name_plural: unit?.translations?.pt?.name_plural || 'mililitros',
		},
	},
	...(unit?.symbol === undefined ? {} : { symbol: unit.symbol }),
	...(unit?.space_before_symbol === undefined ? {} : { space_before_symbol: unit.space_before_symbol }),
	allow_decimal: unit?.allow_decimal ?? true,
	kind: unit?.kind || 'volume',
});
