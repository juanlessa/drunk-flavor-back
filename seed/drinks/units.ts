import { ObjectId } from 'mongodb';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { logger } from '@/shared/providers/logger';

const units = [
	{
		_id: new ObjectId(),
		translations: {
			en: { name: 'milliliter', name_plural: 'milliliters' },
			pt: { name: 'mililitro', name_plural: 'mililitros' },
		},
		symbol: 'ml',
		space_before_symbol: false,
		allow_decimal: true,
		kind: 'volume',
		created_at: new Date(),
		updated_at: new Date(),
	},
] as const satisfies readonly Unit[];

type UnitEnName = (typeof units)[number]['translations']['en']['name'];

export const unitsMap = new Map<UnitEnName, Unit>(
	units.map<[UnitEnName, Unit]>((unit) => [unit.translations.en.name, unit]),
);

export async function insertUnits() {
	try {
		await UnitModel.insertMany(units);
		logger.info('Units inserted successfully');
	} catch (error) {
		logger.error('Error inserting units:', error);
		throw error;
	}
}
