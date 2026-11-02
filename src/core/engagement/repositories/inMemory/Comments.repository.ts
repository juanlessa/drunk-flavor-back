import { randomUUID } from 'node:crypto';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import {
	CommentListQuery,
	CommentSortField,
	CommentVisibilityFilter,
	CreateComment,
	UpdateComment,
	UpdateCommentStatus,
} from '@/core/engagement/dtos/comment.dtos';
import { Comment } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { NotFoundError } from '@/shared/error/error.lib';

const compareValues = (a: unknown, b: unknown): number => {
	if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
	return String(a).localeCompare(String(b));
};

const sortComments = (records: Comment[], sort: CommentListQuery['sort']): Comment[] => {
	const entries = Object.entries(sort) as [CommentSortField, 1 | -1][];
	return [...records].sort((a, b) => {
		for (const [field, direction] of entries) {
			const comparison = compareValues(a[field], b[field]);
			if (comparison !== 0) return comparison * direction;
		}
		return 0;
	});
};

const paginate = (records: Comment[], query: CommentListQuery): Comment[] => {
	const start = (query.page - 1) * query.limit;
	return records.slice(start, start + query.limit);
};

export class CommentsRepositoryInMemory implements ICommentsRepository {
	collection: Comment[] = [];

	async create(data: CreateComment): Promise<Comment> {
		const now = new Date();
		const record: Comment = {
			id: randomUUID(),
			...data,
			status: CommentStatuses.visible,
			createdAt: now,
			updatedAt: now,
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, content }: UpdateComment): Promise<Comment> {
		const record = this.findRequired(id, 'update');
		record.content = content;
		record.updatedAt = new Date();
		return record;
	}

	async updateStatus({ id, status }: UpdateCommentStatus): Promise<Comment> {
		const record = this.findRequired(id, 'status update');
		record.status = status;
		record.updatedAt = new Date();
		return record;
	}

	async delete(id: string): Promise<Comment> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('delete');
		return this.collection.splice(index, 1)[0];
	}

	async findById(id: string): Promise<Comment | null> {
		return this.collection.find((record) => record.id === id) ?? null;
	}

	async findAll(query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]> {
		const found = filter?.status
			? this.collection.filter((record) => record.status === filter.status)
			: this.collection;
		return paginate(sortComments(found, query.sort), query);
	}

	async findByUser(userId: string, query: CommentListQuery): Promise<Comment[]> {
		return paginate(
			sortComments(
				this.collection.filter((record) => record.userId === userId),
				query.sort,
			),
			query,
		);
	}

	async findByDrink(drinkId: string, query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]> {
		const found = this.collection.filter(
			(record) => record.drinkId === drinkId && (filter?.status === undefined || record.status === filter.status),
		);
		return paginate(sortComments(found, query.sort), query);
	}

	async deleteByUser(userId: string): Promise<number> {
		return this.deleteMatching((record) => record.userId === userId);
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		return this.deleteMatching((record) => record.drinkId === drinkId);
	}

	private findRequired(id: string, operation: string): Comment {
		const record = this.collection.find((candidate) => candidate.id === id);
		if (!record) throw this.notFound(operation);
		return record;
	}

	private deleteMatching(predicate: (record: Comment) => boolean): number {
		const initialLength = this.collection.length;
		this.collection = this.collection.filter((record) => !predicate(record));
		return initialLength - this.collection.length;
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.comments.notFound', {
			path: 'CommentsInMemory.repository',
			cause: `Comment missing during ${operation}`,
		});
	}
}
