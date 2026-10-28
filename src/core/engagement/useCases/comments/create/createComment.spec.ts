import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateCommentService } from './CreateComment.service';

let commentsRepository: ICommentsRepository;
let service: CreateCommentService;
let drinkId: string;
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Create Comment', () => {
	beforeEach(() => {
		commentsRepository = new CommentsRepositoryInMemory();
		service = new CreateCommentService(commentsRepository);
		drinkId = new ObjectId().toString();
	});

	it('creates a comment owned by the actor and defaults to visible', async () => {
		const id = await service.execute({ drinkId, content: 'nice', actor });
		const created = await commentsRepository.findById(id);
		expect(created?.userId).toBe(actor.id);
		expect(created?.status).toBe(CommentStatuses.visible);
	});

	it('allows multiple comments per pair', async () => {
		await service.execute({ drinkId, content: 'first', actor });
		await service.execute({ drinkId, content: 'second', actor });
		const mine = await commentsRepository.findByUser(actor.id, {
			page: 1,
			limit: 50,
			sort: { createdAt: -1, id: -1 },
		});
		expect(mine.length).toBe(2);
	});
});
