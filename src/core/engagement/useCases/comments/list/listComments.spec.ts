import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { EngagementActor } from '@/core/engagement/types/actor.types';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListCommentsService } from './ListComments.service';
import { ListCommentsByDrinkService } from '../listByDrink/ListCommentsByDrink.service';
import { ListMyCommentsService } from '../listMine/ListMyComments.service';

const query: CommentListQuery = { page: 1, limit: 50, sort: { created_at: -1, _id: -1 } };

let commentsRepository: ICommentsRepository;
const drinkId = new ObjectId().toString();
const actor: EngagementActor = { id: new ObjectId().toString(), role: Roles.member };

describe('List Comments', () => {
	beforeEach(async () => {
		commentsRepository = new CommentsRepositoryInMemory();
		await commentsRepository.create({ drink_id: drinkId, user_id: actor.id, content: 'visible' });
		const hidden = await commentsRepository.create({ drink_id: drinkId, user_id: actor.id, content: 'hidden' });
		await commentsRepository.updateStatus({ id: hidden._id.toString(), status: CommentStatuses.hidden });
	});

	it('exposes only visible comments in the global list', async () => {
		const service = new ListCommentsService(commentsRepository);
		const result = await service.execute({ query });
		expect(result.length).toBe(1);
		expect(result[0].status).toBe(CommentStatuses.visible);
	});

	it('exposes only visible comments by drink', async () => {
		const service = new ListCommentsByDrinkService(commentsRepository);
		const result = await service.execute({ drink_id: drinkId, query });
		expect(result.length).toBe(1);
	});

	it('returns an empty array for a valid nonexistent drink', async () => {
		const service = new ListCommentsByDrinkService(commentsRepository);
		expect(await service.execute({ drink_id: new ObjectId().toString(), query })).toEqual([]);
	});

	it('returns all own statuses for the current user', async () => {
		const service = new ListMyCommentsService(commentsRepository);
		const result = await service.execute({ query, actor });
		expect(result.length).toBe(2);
	});
});
