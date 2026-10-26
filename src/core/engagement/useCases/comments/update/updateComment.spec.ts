import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateCommentService } from './UpdateComment.service';

let commentsRepository: ICommentsRepository;
let service: UpdateCommentService;

const ownerId = new ObjectId().toString();
const drinkId = new ObjectId().toString();
const owner: Actor = { id: ownerId, role: Roles.member };
const foreign: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Update Comment', () => {
	beforeEach(() => {
		commentsRepository = new CommentsRepositoryInMemory();
		service = new UpdateCommentService(commentsRepository);
	});

	it('updates only content and preserves status', async () => {
		const created = await commentsRepository.create({ drink_id: drinkId, user_id: ownerId, content: 'first' });
		await service.execute({ id: created._id.toString(), content: 'edited', actor: owner });
		const updated = await commentsRepository.findById(created._id.toString());
		expect(updated?.content).toBe('edited');
		expect(updated?.status).toBe(CommentStatuses.visible);
	});

	it('rejects a nonexistent comment', async () => {
		await expect(
			service.execute({ id: new ObjectId().toString(), content: 'x', actor: owner }),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('forbids updating a foreign comment', async () => {
		const created = await commentsRepository.create({ drink_id: drinkId, user_id: ownerId, content: 'first' });
		await expect(
			service.execute({ id: created._id.toString(), content: 'x', actor: foreign }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});
});
