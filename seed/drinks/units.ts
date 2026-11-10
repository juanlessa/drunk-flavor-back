import { UnitData } from '@/core/drinks/dtos/unit.dtos';
import { resolveCreateUnitService } from '@/core/drinks/useCases/units/create/createUnit.container';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { logger } from '@/shared/providers/logger';

const units = [
	{
		translations: {
			en: { name: 'milliliter', namePlural: 'milliliters' },
			pt: { name: 'mililitro', namePlural: 'mililitros', gender: 'masculine' },
		},
		symbol: 'ml',
		spaceBeforeSymbol: false,
		allowDecimal: true,
		kind: 'volume',
	},
	{
		translations: {
			en: { name: 'gram', namePlural: 'grams' },
			pt: { name: 'grama', namePlural: 'gramas', gender: 'feminine' },
		},
		symbol: 'g',
		spaceBeforeSymbol: false,
		allowDecimal: true,
		kind: 'mass',
	},
	{
		// Written with the name of the ingredient ("3 limes"), so ingredients that use it need a plural name.
		translations: {
			en: { name: 'unit', namePlural: 'units' },
			pt: { name: 'unidade', namePlural: 'unidades', gender: 'feminine' },
		},
		allowDecimal: false,
		kind: 'count',
		useIngredientName: true,
	},
	{
		translations: {
			en: { name: 'dash', namePlural: 'dashes' },
			pt: { name: 'dash', namePlural: 'dashes', gender: 'masculine' },
		},
		allowDecimal: false,
		kind: 'informal',
	},
	{
		translations: {
			en: { name: 'leaf', namePlural: 'leaves' },
			pt: { name: 'folha', namePlural: 'folhas', gender: 'feminine' },
		},
		spaceBeforeSymbol: true,
		allowDecimal: false,
		kind: 'count',
	},
	{
		translations: {
			en: { name: 'sprig', namePlural: 'sprigs' },
			pt: { name: 'ramo', namePlural: 'ramos', gender: 'masculine' },
		},
		allowDecimal: false,
		kind: 'count',
	},
	{
		translations: {
			en: { name: 'slice', namePlural: 'slices' },
			pt: { name: 'fatia', namePlural: 'fatias', gender: 'feminine' },
		},
		allowDecimal: false,
		kind: 'count',
	},
	{
		translations: {
			en: { name: 'wedge', namePlural: 'wedges' },
			pt: { name: 'gomo', namePlural: 'gomos', gender: 'masculine' },
		},
		allowDecimal: false,
		kind: 'count',
	},
	{
		translations: {
			en: { name: 'twist', namePlural: 'twists' },
			pt: { name: 'twist', namePlural: 'twists', gender: 'masculine' },
		},
		allowDecimal: false,
		kind: 'count',
	},
	{
		translations: {
			en: { name: 'bean', namePlural: 'beans' },
			pt: { name: 'grão', namePlural: 'grãos', gender: 'masculine' },
		},
		allowDecimal: false,
		kind: 'count',
	},
] as const satisfies readonly UnitData[];

type UnitEnName = (typeof units)[number]['translations']['en']['name'];

/** Created units keyed by their English singular name, for ingredients.ts to reference. */
export const unitsMap = new Map<UnitEnName, Unit>();

export async function insertUnits(actor: Actor) {
	try {
		const service = resolveCreateUnitService();
		for (const unit of units) {
			const created = await service.execute({ ...unit, actor });
			unitsMap.set(unit.translations.en.name, created);
		}
		logger.info('Units inserted successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error inserting units');
		throw error;
	}
}
