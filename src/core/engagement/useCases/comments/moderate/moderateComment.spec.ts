import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { EngagementActor } from '@/core/engagement/types/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { ModerateCommentService } from './ModerateComment.service';

let commentsRepository: ICommentsRepository;
let service: ModerateCommentService;

const ownerId = new ObjectId().toString();
const drinkId = new ObjectId().toString();
const admin: EngagementActor = { id: new ObjectId().toString(), role: Roles.admin };
const member: EngagementActor = { id: new ObjectId().toString(), role: Roles.member };

describe('Moderate Comment', () => {
	beforeEach(() => {
		commentsRepository = new CommentsRepositoryInMemory();
		service = new ModerateCommentService(commentsRepository);
	});

	it('allows an Admin to change only status', async () => {
		const created = await commentsRepository.create({ drink_id: drinkId, user_id: ownerId, content: 'a' });
		await service.execute({ id: created._id.toString(), status: CommentStatuses.hidden, actor: admin });
		const updated = await commentsRepository.findById(created._id.toString());
		expect(updated?.status).toBe(CommentStatuses.hidden);
		expect(updated?.content).toBe('a');
	});

	it('forbids a non-admin from moderating', async () => {
		const created = await commentsRepository.create({ drink_id: drinkId, user_id: member.id, content: 'a' });
		await expect(
			service.execute({ id: created._id.toString(), status: CommentStatuses.hidden, actor: member }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('rejects a nonexistent comment', async () => {
		await expect(
			service.execute({ id: new ObjectId().toString(), status: CommentStatuses.hidden, actor: admin }),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
