import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { CommentPersistence } from '../entities/comment.model';
import { RatingPersistence } from '../entities/rating.model';
import { CommentMapper } from './comment.mapper';
import { RatingMapper } from './rating.mapper';

const createdAt = new Date('2025-01-01T00:00:00.000Z');
const updatedAt = new Date('2025-01-02T00:00:00.000Z');

describe('Engagement domain persistence mappers', () => {
	it('maps Comment between snake_case persistence and camelCase domain data', () => {
		const persistence: CommentPersistence = {
			_id: new Types.ObjectId(),
			drink_id: 'drink-id',
			user_id: 'user-id',
			content: 'Comment',
			status: CommentStatuses.visible,
			created_at: createdAt,
			updated_at: updatedAt,
		};

		const comment = CommentMapper.toDomain({ ...persistence, __v: 1 } as CommentPersistence);

		expect(comment).toEqual({
			id: persistence._id.toHexString(),
			drinkId: 'drink-id',
			userId: 'user-id',
			content: 'Comment',
			status: CommentStatuses.visible,
			createdAt,
			updatedAt,
		});
		expect(comment).not.toHaveProperty('__v');

		const mapped = CommentMapper.toPersistence(comment);
		expect(mapped._id).toBeInstanceOf(Types.ObjectId);
		expect(mapped).toMatchObject({
			drink_id: 'drink-id',
			user_id: 'user-id',
			created_at: createdAt,
			updated_at: updatedAt,
		});
		expect(mapped).not.toHaveProperty('drinkId');
	});

	it('maps Rating between snake_case persistence and camelCase domain data', () => {
		const persistence: RatingPersistence = {
			_id: new Types.ObjectId(),
			drink_id: 'drink-id',
			user_id: 'user-id',
			value: 4,
			created_at: createdAt,
			updated_at: updatedAt,
		};

		const rating = RatingMapper.toDomain({ ...persistence, __v: 1 } as RatingPersistence);

		expect(rating).toEqual({
			id: persistence._id.toHexString(),
			drinkId: 'drink-id',
			userId: 'user-id',
			value: 4,
			createdAt,
			updatedAt,
		});
		expect(rating).not.toHaveProperty('__v');

		const mapped = RatingMapper.toPersistence(rating);
		expect(mapped._id).toBeInstanceOf(Types.ObjectId);
		expect(mapped).toMatchObject({
			drink_id: 'drink-id',
			user_id: 'user-id',
			created_at: createdAt,
			updated_at: updatedAt,
		});
		expect(mapped).not.toHaveProperty('userId');
	});

	it('maps domain sort fields to Mongo field names', () => {
		expect(CommentMapper.toPersistenceSort({ createdAt: -1, updatedAt: 1, id: -1 })).toEqual({
			created_at: -1,
			updated_at: 1,
			_id: -1,
		});
		expect(RatingMapper.toPersistenceSort({ value: 1, createdAt: -1, id: -1 })).toEqual({
			value: 1,
			created_at: -1,
			_id: -1,
		});
	});
});
