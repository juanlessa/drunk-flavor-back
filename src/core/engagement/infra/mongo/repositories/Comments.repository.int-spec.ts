import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { CommentsRepository } from '@/core/engagement/infra/mongo/repositories/Comments.repository';

const query: CommentListQuery = { page: 1, limit: 50, sort: { createdAt: -1, id: -1 } };
let repository: CommentsRepository;

describe('CommentsRepository (integration)', () => {
	beforeAll(async () => {
		await CommentModel.init();
	});

	afterEach(async () => {
		await CommentModel.deleteMany({});
	});

	it('persists multiple comments for the same drink and user pair', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		await repository.create({ drinkId, userId, content: 'first' });
		await repository.create({ drinkId, userId, content: 'second' });
		expect(await repository.findByUser(userId, query)).toHaveLength(2);
	});

	it('maps snake_case persistence to camelCase domain data', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await repository.create({ drinkId, userId, content: 'first' });
		const persisted = await CommentModel.findById(created.id).lean();

		expect(created).toMatchObject({ drinkId, userId, content: 'first', status: CommentStatuses.visible });
		expect(created).not.toHaveProperty('_id');
		expect(persisted).toMatchObject({ drink_id: drinkId, user_id: userId });
	});

	it('updates only content and preserves associations and status', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await repository.create({ drinkId, userId, content: 'first' });
		const updated = await repository.update({ id: created.id, content: 'edited' });

		expect(updated).toMatchObject({ content: 'edited', status: CommentStatuses.visible, drinkId, userId });
	});

	it('updates only status and preserves content and associations', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await repository.create({ drinkId, userId, content: 'keep' });
		const updated = await repository.updateStatus({ id: created.id, status: CommentStatuses.hidden });

		expect(updated).toMatchObject({ status: CommentStatuses.hidden, content: 'keep', drinkId, userId });
	});

	it('returns domain documents without Mongo internals', async () => {
		repository = new CommentsRepository();
		const created = await repository.create({
			drinkId: new ObjectId().toString(),
			userId: new ObjectId().toString(),
			content: 'lean',
		});
		const found = await repository.findById(created.id);

		expect(found).not.toBeNull();
		expect(found as Record<string, unknown>).not.toHaveProperty('__v');
		expect(found as Record<string, unknown>).not.toHaveProperty('_id');
	});

	it('applies visibility and find variants correctly', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const visible = await repository.create({ drinkId, userId, content: 'visible' });
		const hidden = await repository.create({ drinkId, userId, content: 'hidden' });
		await repository.updateStatus({ id: hidden.id, status: CommentStatuses.hidden });

		const visibleOnly = await repository.findByDrink(drinkId, query, { status: CommentStatuses.visible });
		expect(visibleOnly.map((comment) => comment.id)).toEqual([visible.id]);
		expect(await repository.findByUser(userId, query)).toHaveLength(2);
	});

	it('returns exact bulk delete counts including zero on repeat', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		await repository.create({ drinkId, userId, content: 'a' });
		await repository.create({ drinkId, userId: new ObjectId().toString(), content: 'b' });

		expect(await repository.deleteByDrink(drinkId)).toBe(2);
		expect(await repository.deleteByDrink(drinkId)).toBe(0);
		expect(await repository.deleteByUser(userId)).toBe(0);
	});

	it('maps createdAt and id sort fields to Mongo across pages', async () => {
		repository = new CommentsRepository();
		const userId = new ObjectId().toString();
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await CommentModel.collection.insertMany(
			ids.map((id) => ({
				_id: id,
				drink_id: new ObjectId().toString(),
				user_id: userId,
				content: 'ordered',
				status: CommentStatuses.visible,
				created_at: sharedDate,
				updated_at: sharedDate,
			})),
		);
		const expected = ids.map(String).sort((a, b) => (a > b ? -1 : 1));
		const first = await repository.findByUser(userId, { page: 1, limit: 2, sort: { createdAt: -1, id: -1 } });
		const second = await repository.findByUser(userId, { page: 2, limit: 2, sort: { createdAt: -1, id: -1 } });

		expect(first.map((comment) => comment.id)).toEqual(expected.slice(0, 2));
		expect(second.map((comment) => comment.id)).toEqual(expected.slice(2));
	});
});
