import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { EngagementModule } from './EngagementModule';

let repository: CommentsRepositoryInMemory;
let engagementModule: EngagementModule;

beforeEach(() => {
	repository = new CommentsRepositoryInMemory();
	engagementModule = new EngagementModule(repository);
});

describe('EngagementModule public API', () => {
	it('deletes every comment owned by a user and returns the count', async () => {
		const userId = new ObjectId().toString();
		await repository.create({ drinkId: new ObjectId().toString(), userId, content: 'first' });
		await repository.create({ drinkId: new ObjectId().toString(), userId, content: 'second' });
		await repository.create({
			drinkId: new ObjectId().toString(),
			userId: new ObjectId().toString(),
			content: 'other',
		});

		await expect(engagementModule.deleteCommentsByUser(userId)).resolves.toBe(2);
		expect(repository.collection).toHaveLength(1);
	});

	it('returns zero when the user has no comments', async () => {
		await expect(engagementModule.deleteCommentsByUser('missing-user')).resolves.toBe(0);
	});
});
