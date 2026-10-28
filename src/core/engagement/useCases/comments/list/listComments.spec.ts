import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListCommentsService } from './ListComments.service';
import { ListCommentsByDrinkService } from '../listByDrink/ListCommentsByDrink.service';
import { ListMyCommentsService } from '../listMine/ListMyComments.service';

const query: CommentListQuery = { page: 1, limit: 50, sort: { createdAt: -1, id: -1 } };
let commentsRepository: ICommentsRepository;
const drinkId = new ObjectId().toString();
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('List Comments', () => {
	beforeEach(async () => {
		commentsRepository = new CommentsRepositoryInMemory();
		await commentsRepository.create({ drinkId, userId: actor.id, content: 'visible' });
		const hidden = await commentsRepository.create({ drinkId, userId: actor.id, content: 'hidden' });
		await commentsRepository.updateStatus({ id: hidden.id, status: CommentStatuses.hidden });
	});

	it('exposes only visible comments in the global list', async () => {
		const result = await new ListCommentsService(commentsRepository).execute({ query });
		expect(result).toHaveLength(1);
		expect(result[0].status).toBe(CommentStatuses.visible);
	});

	it('exposes only visible comments by drink', async () => {
		const result = await new ListCommentsByDrinkService(commentsRepository).execute({ drinkId, query });
		expect(result).toHaveLength(1);
	});

	it('returns an empty array for a valid nonexistent drink', async () => {
		expect(
			await new ListCommentsByDrinkService(commentsRepository).execute({
				drinkId: new ObjectId().toString(),
				query,
			}),
		).toEqual([]);
	});

	it('returns all own statuses for the current user', async () => {
		expect(await new ListMyCommentsService(commentsRepository).execute({ query, actor })).toHaveLength(2);
	});
});
