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
let drink_id: string;

const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Create Comment', () => {
	beforeEach(async () => {
		commentsRepository = new CommentsRepositoryInMemory();
		service = new CreateCommentService(commentsRepository);
		drink_id = new ObjectId().toString();
	});

	it('creates a comment owned by the actor and defaults to visible', async () => {
		const id = await service.execute({ drink_id, content: 'nice', actor });
		const created = await commentsRepository.findById(id);
		expect(created?.user_id).toBe(actor.id);
		expect(created?.status).toBe(CommentStatuses.visible);
	});

	it('allows multiple comments per pair', async () => {
		await service.execute({ drink_id, content: 'first', actor });
		await service.execute({ drink_id, content: 'second', actor });
		const mine = await commentsRepository.findByUser(actor.id, {
			page: 1,
			limit: 50,
			sort: { created_at: -1, _id: -1 },
		});
		expect(mine.length).toBe(2);
	});
});
