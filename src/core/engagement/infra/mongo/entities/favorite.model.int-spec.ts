import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { FAVORITE_DRINK_USER_UNIQUE_INDEX, FavoriteModel } from '@/core/engagement/infra/mongo/entities/favorite.model';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> =>
	(await FavoriteModel.collection.indexes()) as unknown as IndexInfo[];

describe('FavoriteModel (integration)', () => {
	beforeAll(async () => {
		await FavoriteModel.init();
	});

	afterEach(async () => {
		await FavoriteModel.deleteMany({});
	});

	it('resolves to the favorites collection', () => {
		expect(FavoriteModel.collection.collectionName).toBe('favorites');
	});

	it('declares exactly the expected named indexes', async () => {
		const names = (await getIndexes()).map((index) => index.name).sort();

		expect(names).toEqual(['_id_', FAVORITE_DRINK_USER_UNIQUE_INDEX, 'favorite_user_created_id'].sort());
	});

	it('enforces a unique (drink_id, user_id) index', async () => {
		const pairIndex = (await getIndexes()).find((index) => index.name === FAVORITE_DRINK_USER_UNIQUE_INDEX);

		expect(pairIndex?.key).toEqual({ drink_id: 1, user_id: 1 });
		expect(pairIndex?.unique).toBe(true);
	});

	it('keeps drink_id and user_id immutable on update', async () => {
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await FavoriteModel.create({ drink_id: drinkId, user_id: userId });

		created.set({ drink_id: new ObjectId().toString(), user_id: new ObjectId().toString() });
		await created.save();

		const reloaded = await FavoriteModel.findById(created._id).lean();
		expect(reloaded?.drink_id).toBe(drinkId);
		expect(reloaded?.user_id).toBe(userId);
	});

	it('stores created_at and no updated_at', async () => {
		const created = await FavoriteModel.create({
			drink_id: new ObjectId().toString(),
			user_id: new ObjectId().toString(),
		});

		const stored = await FavoriteModel.findById(created._id).lean();
		expect(stored?.created_at).toBeInstanceOf(Date);
		expect(stored).not.toHaveProperty('updated_at');
	});
});
