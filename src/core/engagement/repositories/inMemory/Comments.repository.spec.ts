import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';

const query: CommentListQuery = { page: 1, limit: 50, sort: { created_at: -1, _id: -1 } };

let repository: CommentsRepositoryInMemory;
const drinkId = new ObjectId().toString();
const userId = new ObjectId().toString();

describe('CommentsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new CommentsRepositoryInMemory();
	});

	it('defaults new comments to visible', async () => {
		const created = await repository.create({ drink_id: drinkId, user_id: userId, content: 'hi' });
		expect(created.status).toBe(CommentStatuses.visible);
	});

	it('allows multiple comments per (drink_id, user_id) pair', async () => {
		await repository.create({ drink_id: drinkId, user_id: userId, content: 'first' });
		await repository.create({ drink_id: drinkId, user_id: userId, content: 'second' });
		expect((await repository.findByUser(userId, query)).length).toBe(2);
	});

	it('updates only content and preserves associations and status', async () => {
		const created = await repository.create({ drink_id: drinkId, user_id: userId, content: 'first' });
		const updated = await repository.update({ id: created._id.toString(), content: 'edited' });
		expect(updated.content).toBe('edited');
		expect(updated.status).toBe(CommentStatuses.visible);
		expect(updated.drink_id).toBe(drinkId);
		expect(updated.user_id).toBe(userId);
		expect(updated.created_at).toEqual(created.created_at);
	});

	it('updates only status through updateStatus and preserves content', async () => {
		const created = await repository.create({ drink_id: drinkId, user_id: userId, content: 'first' });
		const updated = await repository.updateStatus({ id: created._id.toString(), status: CommentStatuses.hidden });
		expect(updated.status).toBe(CommentStatuses.hidden);
		expect(updated.content).toBe('first');
	});

	it('applies the visibility filter in findAll and findByDrink', async () => {
		const visible = await repository.create({ drink_id: drinkId, user_id: userId, content: 'visible' });
		const hidden = await repository.create({ drink_id: drinkId, user_id: userId, content: 'hidden' });
		await repository.updateStatus({ id: hidden._id.toString(), status: CommentStatuses.hidden });

		const all = await repository.findAll(query, { status: CommentStatuses.visible });
		expect(all.map((c) => c._id.toString())).toEqual([visible._id.toString()]);

		const byDrink = await repository.findByDrink(drinkId, query, { status: CommentStatuses.visible });
		expect(byDrink.map((c) => c._id.toString())).toEqual([visible._id.toString()]);
	});

	it('returns all statuses in findByUser', async () => {
		const hidden = await repository.create({ drink_id: drinkId, user_id: userId, content: 'hidden' });
		await repository.updateStatus({ id: hidden._id.toString(), status: CommentStatuses.hidden });
		expect((await repository.findByUser(userId, query)).length).toBe(1);
	});

	it('returns exact bulk delete counts including zero', async () => {
		await repository.create({ drink_id: drinkId, user_id: userId, content: 'a' });
		await repository.create({ drink_id: drinkId, user_id: userId, content: 'b' });
		expect(await repository.deleteByDrink(drinkId)).toBe(2);
		expect(await repository.deleteByUser(userId)).toBe(0);
	});
});
