import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';

const query: CommentListQuery = { page: 1, limit: 50, sort: { createdAt: -1, id: -1 } };

let repository: CommentsRepositoryInMemory;
const drinkId = new ObjectId().toString();
const userId = new ObjectId().toString();

describe('CommentsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new CommentsRepositoryInMemory();
	});

	it('defaults new comments to visible', async () => {
		const created = await repository.create({ drinkId, userId, content: 'hi' });
		expect(created.status).toBe(CommentStatuses.visible);
	});

	it('allows multiple comments per drink and user pair', async () => {
		await repository.create({ drinkId, userId, content: 'first' });
		await repository.create({ drinkId, userId, content: 'second' });
		expect((await repository.findByUser(userId, query)).length).toBe(2);
	});

	it('updates only content and preserves associations and status', async () => {
		const created = await repository.create({ drinkId, userId, content: 'first' });
		const updated = await repository.update({ id: created.id, content: 'edited' });
		expect(updated.content).toBe('edited');
		expect(updated.status).toBe(CommentStatuses.visible);
		expect(updated.drinkId).toBe(drinkId);
		expect(updated.userId).toBe(userId);
		expect(updated.createdAt).toEqual(created.createdAt);
	});

	it('updates only status through updateStatus and preserves content', async () => {
		const created = await repository.create({ drinkId, userId, content: 'first' });
		const updated = await repository.updateStatus({ id: created.id, status: CommentStatuses.hidden });
		expect(updated.status).toBe(CommentStatuses.hidden);
		expect(updated.content).toBe('first');
	});

	it('applies the visibility filter in findAll and findByDrink', async () => {
		const visible = await repository.create({ drinkId, userId, content: 'visible' });
		const hidden = await repository.create({ drinkId, userId, content: 'hidden' });
		await repository.updateStatus({ id: hidden.id, status: CommentStatuses.hidden });

		const all = await repository.findAll(query, { status: CommentStatuses.visible });
		expect(all.map((comment) => comment.id)).toEqual([visible.id]);

		const byDrink = await repository.findByDrink(drinkId, query, { status: CommentStatuses.visible });
		expect(byDrink.map((comment) => comment.id)).toEqual([visible.id]);
	});

	it('returns all statuses in findByUser', async () => {
		const hidden = await repository.create({ drinkId, userId, content: 'hidden' });
		await repository.updateStatus({ id: hidden.id, status: CommentStatuses.hidden });
		expect((await repository.findByUser(userId, query)).length).toBe(1);
	});

	it('returns exact bulk delete counts including zero', async () => {
		await repository.create({ drinkId, userId, content: 'a' });
		await repository.create({ drinkId, userId, content: 'b' });
		expect(await repository.deleteByDrink(drinkId)).toBe(2);
		expect(await repository.deleteByUser(userId)).toBe(0);
	});
});
