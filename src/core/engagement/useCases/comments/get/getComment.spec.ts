import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetCommentService } from './GetComment.service';

let commentsRepository: ICommentsRepository;
let service: GetCommentService;

const drinkId = new ObjectId().toString();
const userId = new ObjectId().toString();

describe('Get Comment', () => {
	beforeEach(() => {
		commentsRepository = new CommentsRepositoryInMemory();
		service = new GetCommentService(commentsRepository);
	});

	it('returns a visible comment', async () => {
		const created = await commentsRepository.create({ drink_id: drinkId, user_id: userId, content: 'hi' });
		const found = await service.execute({ id: created._id.toString() });
		expect(found._id.toString()).toBe(created._id.toString());
	});

	it.each([CommentStatuses.hidden, CommentStatuses.flagged])('treats a %s comment as missing', async (status) => {
		const created = await commentsRepository.create({ drink_id: drinkId, user_id: userId, content: 'hi' });
		await commentsRepository.updateStatus({ id: created._id.toString(), status });
		await expect(service.execute({ id: created._id.toString() })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('rejects a nonexistent comment', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(BadRequestError);
	});
});
