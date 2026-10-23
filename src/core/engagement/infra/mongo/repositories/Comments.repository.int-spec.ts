import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { CommentsRepository } from '@/core/engagement/infra/mongo/repositories/Comments.repository';

const query: CommentListQuery = { page: 1, limit: 50, sort: { created_at: -1, _id: -1 } };

let repository: CommentsRepository;

describe('CommentsRepository (integration)', () => {
	beforeAll(async () => {
		await CommentModel.init();
	});

	afterEach(async () => {
		await CommentModel.deleteMany({});
	});

	it('persists multiple comments for the same (drink_id, user_id) pair', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();

		await repository.create({ drink_id: drinkId, user_id: userId, content: 'first' });
		await repository.create({ drink_id: drinkId, user_id: userId, content: 'second' });

		expect((await repository.findByUser(userId, query)).length).toBe(2);
	});

	it('updates only content and preserves associations and status', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await repository.create({ drink_id: drinkId, user_id: userId, content: 'first' });

		const updated = await repository.update({ id: created._id.toString(), content: 'edited' });

		expect(updated.content).toBe('edited');
		expect(updated.status).toBe(CommentStatuses.visible);
		expect(updated.drink_id).toBe(drinkId);
		expect(updated.user_id).toBe(userId);
	});

	it('updates only status and preserves content and associations', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();
		const created = await repository.create({ drink_id: drinkId, user_id: userId, content: 'keep' });

		const updated = await repository.updateStatus({ id: created._id.toString(), status: CommentStatuses.hidden });

		expect(updated.status).toBe(CommentStatuses.hidden);
		expect(updated.content).toBe('keep');
		expect(updated.drink_id).toBe(drinkId);
		expect(updated.user_id).toBe(userId);
	});

	it('returns lean documents without __v', async () => {
		repository = new CommentsRepository();
		const created = await repository.create({
			drink_id: new ObjectId().toString(),
			user_id: new ObjectId().toString(),
			content: 'lean',
		});

		const found = await repository.findById(created._id.toString());

		expect(found).not.toBeNull();
		expect(found as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('applies the visibility filter and resolves find variants correctly', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();

		const visible = await repository.create({ drink_id: drinkId, user_id: userId, content: 'visible' });
		const hidden = await repository.create({ drink_id: drinkId, user_id: userId, content: 'hidden' });
		await repository.updateStatus({ id: hidden._id.toString(), status: CommentStatuses.hidden });

		const visibleOnly = await repository.findByDrink(drinkId, query, { status: CommentStatuses.visible });
		expect(visibleOnly.map((comment) => comment._id.toString())).toEqual([visible._id.toString()]);

		// findByUser returns all statuses for that user.
		expect((await repository.findByUser(userId, query)).length).toBe(2);
	});

	it('returns exact bulk delete counts including zero on repeat', async () => {
		repository = new CommentsRepository();
		const drinkId = new ObjectId().toString();
		const userId = new ObjectId().toString();

		await repository.create({ drink_id: drinkId, user_id: userId, content: 'a' });
		await repository.create({ drink_id: drinkId, user_id: new ObjectId().toString(), content: 'b' });

		expect(await repository.deleteByDrink(drinkId)).toBe(2);
		expect(await repository.deleteByDrink(drinkId)).toBe(0);
		expect(await repository.deleteByUser(userId)).toBe(0);
	});

	it('honors created_at desc with _id desc tie-breaker across pages', async () => {
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

		const expectedOrder = [...ids].map((id) => id.toString()).sort((a, b) => (a > b ? -1 : 1));

		const firstPage = await repository.findByUser(userId, {
			page: 1,
			limit: 2,
			sort: { created_at: -1, _id: -1 },
		});
		const secondPage = await repository.findByUser(userId, {
			page: 2,
			limit: 2,
			sort: { created_at: -1, _id: -1 },
		});

		expect(firstPage.map((comment) => comment._id.toString())).toEqual(expectedOrder.slice(0, 2));
		expect(secondPage.map((comment) => comment._id.toString())).toEqual(expectedOrder.slice(2, 3));
	});
});
