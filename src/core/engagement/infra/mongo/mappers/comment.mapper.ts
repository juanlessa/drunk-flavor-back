import { Comment } from '@/core/engagement/entities/comment.entity';
import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import {
	mapObjectEntriesDeep,
	mapQueryFields,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';
import { DeepPartial } from '@/shared/types/utility.types';
import { CommentPersistence } from '../entities/comment.model';

export const CommentMapper = {
	toDomain(document: CommentPersistence): Comment {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, { nullHandling: 'toUndefined' }) as Comment;
	},
	toPersistence(data: DeepPartial<Comment>): Partial<CommentPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<CommentPersistence>;
	},
	toObjectId,
	toPersistenceSort(sort: CommentListQuery['sort']): Record<string, 1 | -1> {
		return mapQueryFields(sort) ?? {};
	},
};
