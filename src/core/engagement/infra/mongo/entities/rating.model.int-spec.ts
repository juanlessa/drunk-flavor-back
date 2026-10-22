import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { RATING_DRINK_USER_UNIQUE_INDEX, RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> => (await RatingModel.collection.indexes()) as unknown as IndexInfo[];

describe('RatingModel (integration)', () => {
	beforeAll(async () => {
		await RatingModel.init();
	});

	afterEach(async () => {
		await RatingModel.deleteMany({});
	});

	it('resolves to the ratings collection', () => {
		expect(RatingModel.collection.collectionName).toBe('ratings');
	});

	it('declares exactly the expected named indexes', async () => {
		const names = (await getIndexes()).map((index) => index.name).sort();

		expect(names).toEqual(
			[
				'_id_',
				RATING_DRINK_USER_UNIQUE_INDEX,
				'rating_created_id',
				'rating_drink_created_id',
				'rating_user_created_id',
			].sort(),
		);
	});

	it('enforces a unique (drink_id, user_id) index with no redundant standalone drink_id index', async () => {
		const indexes = await getIndexes();
		const pairIndex = indexes.find((index) => index.name === RATING_DRINK_USER_UNIQUE_INDEX);

		expect(pairIndex?.key).toEqual({ drink_id: 1, user_id: 1 });
		expect(pairIndex?.unique).toBe(true);

		// There must be no index keyed solely on drink_id.
		const standaloneDrinkId = indexes.find(
			(index) => JSON.stringify(index.key) === JSON.stringify({ drink_id: 1 }),
		);
		expect(standaloneDrinkId).toBeUndefined();
	});

	it('keeps drink_id and user_id immutable on update', async () => {
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await RatingModel.create({ drink_id: drinkId, user_id: userId, value: 3 });

		created.set({ drink_id: new ObjectId().toString(), user_id: new ObjectId().toString() });
		await created.save();

		const reloaded = await RatingModel.findById(created._id).lean();
		expect(reloaded?.drink_id).toBe(drinkId);
		expect(reloaded?.user_id).toBe(userId);
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await RatingModel.create({
			drink_id: new ObjectId().toString(),
			user_id: new ObjectId().toString(),
			value: 3,
		});
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.value = 4;
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});

	it('rejects out-of-range and non-integer values at the Mongoose boundary', async () => {
		const base = { drink_id: new ObjectId().toString(), user_id: new ObjectId().toString() };

		await expect(RatingModel.create({ ...base, value: 0 })).rejects.toThrow();
		await expect(RatingModel.create({ ...base, value: 6 })).rejects.toThrow();
		await expect(RatingModel.create({ ...base, value: 3.5 })).rejects.toThrow();
	});
});
