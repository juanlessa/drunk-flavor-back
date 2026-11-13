import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { DeleteCommentsByUserService } from './DeleteCommentsByUser.service';

let commentsRepository: CommentsRepositoryInMemory;
let service: DeleteCommentsByUserService;

describe('Delete Comments By User', () => {
	beforeEach(() => {
		commentsRepository = new CommentsRepositoryInMemory();
		service = new DeleteCommentsByUserService(commentsRepository);
	});

	it('deletes every comment owned by a user and returns the count', async () => {
		const userId = new ObjectId().toString();
		await commentsRepository.create({ drinkId: new ObjectId().toString(), userId, content: 'first' });
		await commentsRepository.create({ drinkId: new ObjectId().toString(), userId, content: 'second' });
		await commentsRepository.create({
			drinkId: new ObjectId().toString(),
			userId: new ObjectId().toString(),
			content: 'other',
		});

		await expect(service.execute({ userId })).resolves.toBe(2);
		expect(commentsRepository.collection).toHaveLength(1);
	});

	it('returns zero when the user has no comments', async () => {
		await expect(service.execute({ userId: 'missing-user' })).resolves.toBe(0);
	});
});
