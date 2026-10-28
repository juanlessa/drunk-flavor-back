import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteCommentService } from './DeleteComment.service';

let commentsRepository: ICommentsRepository;
let service: DeleteCommentService;
const ownerId = new ObjectId().toString();
const drinkId = new ObjectId().toString();
const owner: Actor = { id: ownerId, role: Roles.member };
const admin: Actor = { id: new ObjectId().toString(), role: Roles.admin };
const foreignMember: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Delete Comment', () => {
	beforeEach(() => {
		commentsRepository = new CommentsRepositoryInMemory();
		service = new DeleteCommentService(commentsRepository);
	});

	it('allows an owner to delete its comment', async () => {
		const created = await commentsRepository.create({ drinkId, userId: ownerId, content: 'a' });
		await service.execute({ id: created.id, actor: owner });
		expect(await commentsRepository.findById(created.id)).toBeNull();
	});

	it('allows an Admin to delete a foreign comment', async () => {
		const created = await commentsRepository.create({ drinkId, userId: ownerId, content: 'a' });
		await service.execute({ id: created.id, actor: admin });
		expect(await commentsRepository.findById(created.id)).toBeNull();
	});

	it('forbids a non-owner from deleting a foreign comment', async () => {
		const created = await commentsRepository.create({ drinkId, userId: ownerId, content: 'a' });
		await expect(service.execute({ id: created.id, actor: foreignMember })).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('rejects a nonexistent comment', async () => {
		await expect(service.execute({ id: new ObjectId().toString(), actor: owner })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
});
