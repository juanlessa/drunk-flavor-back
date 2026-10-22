import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { COMMENT_CONTENT_MAX_LENGTH } from '@/core/engagement/constants/comment.constants';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> =>
	(await CommentModel.collection.indexes()) as unknown as IndexInfo[];

describe('CommentModel (integration)', () => {
	beforeAll(async () => {
		await CommentModel.init();
	});

	afterEach(async () => {
		await CommentModel.deleteMany({});
	});

	it('resolves to the comments collection', () => {
		expect(CommentModel.collection.collectionName).toBe('comments');
	});

	it('declares exactly the expected named indexes', async () => {
		const names = (await getIndexes()).map((index) => index.name).sort();

		expect(names).toEqual(
			['_id_', 'comment_drink_status_created_id', 'comment_status_created_id', 'comment_user_created_id'].sort(),
		);
	});

	it('has no unique index on any pair', async () => {
		const indexes = await getIndexes();
		const uniqueIndexes = indexes.filter((index) => index.unique === true);

		expect(uniqueIndexes).toHaveLength(0);
	});

	it('allows multiple comments for the same (drink_id, user_id) pair', async () => {
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();

		await CommentModel.create({ drink_id: drinkId, user_id: userId, content: 'first' });
		await CommentModel.create({ drink_id: drinkId, user_id: userId, content: 'second' });

		const count = await CommentModel.countDocuments({ drink_id: drinkId, user_id: userId });
		expect(count).toBe(2);
	});

	it('defaults status to visible', async () => {
		const created = await CommentModel.create({
			drink_id: new ObjectId().toString(),
			user_id: new ObjectId().toString(),
			content: 'hello',
		});

		expect(created.status).toBe(CommentStatuses.visible);
	});

	it('keeps drink_id and user_id immutable on update', async () => {
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await CommentModel.create({ drink_id: drinkId, user_id: userId, content: 'keep' });

		created.set({ drink_id: new ObjectId().toString(), user_id: new ObjectId().toString() });
		await created.save();

		const reloaded = await CommentModel.findById(created._id).lean();
		expect(reloaded?.drink_id).toBe(drinkId);
		expect(reloaded?.user_id).toBe(userId);
	});

	it('trims content and enforces min/max length at the persistence boundary', async () => {
		const base = { drink_id: new ObjectId().toString(), user_id: new ObjectId().toString() };

		const trimmed = await CommentModel.create({ ...base, content: '  spaced  ' });
		expect(trimmed.content).toBe('spaced');

		await expect(CommentModel.create({ ...base, content: '' })).rejects.toThrow();
		await expect(
			CommentModel.create({ ...base, content: 'x'.repeat(COMMENT_CONTENT_MAX_LENGTH + 1) }),
		).rejects.toThrow();
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await CommentModel.create({
			drink_id: new ObjectId().toString(),
			user_id: new ObjectId().toString(),
			content: 'first',
		});
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.content = 'edited';
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
