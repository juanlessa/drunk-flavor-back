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
import { ObjectId } from 'mongodb';

const compareValues = (a: unknown, b: unknown): number => {
	if (a instanceof Date && b instanceof Date) {
		return a.getTime() - b.getTime();
	}
	const aStr = String(a);
	const bStr = String(b);
	if (aStr < bStr) return -1;
	if (aStr > bStr) return 1;
	return 0;
};

const getSortableValue = (record: Comment, field: CommentSortField): unknown => {
	if (field === '_id') return record._id.toString();
	return record[field];
};

const sortComments = (records: Comment[], sort: CommentListQuery['sort']): Comment[] => {
	const entries = Object.entries(sort) as [CommentSortField, 1 | -1][];
	return [...records].sort((a, b) => {
		for (const [field, direction] of entries) {
			const comparison = compareValues(getSortableValue(a, field), getSortableValue(b, field));
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
		const record: Comment = {
			_id: new ObjectId(),
			drink_id: data.drink_id,
			user_id: data.user_id,
			content: data.content,
			status: CommentStatuses.visible,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, content }: UpdateComment): Promise<Comment> {
		const recordIndex = this.collection.findIndex((record) => record._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.comments.notFound', {
				path: 'CommentsInMemory.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		const record = this.collection[recordIndex];
		record.content = content;
		record.updated_at = new Date();
		this.collection[recordIndex] = record;
		return record;
	}

	async updateStatus({ id, status }: UpdateCommentStatus): Promise<Comment> {
		const recordIndex = this.collection.findIndex((record) => record._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.comments.notFound', {
				path: 'CommentsInMemory.repository',
				cause: 'Error on findByIdAndUpdate status operation',
			});
		}
		const record = this.collection[recordIndex];
		record.status = status;
		record.updated_at = new Date();
		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Comment> {
		const recordIndex = this.collection.findIndex((record) => record._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.comments.notFound', {
				path: 'CommentsInMemory.repository',
				cause: 'Error on findByIdAndDelete operation',
			});
		}
		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findById(id: string): Promise<Comment | null> {
		return this.collection.find((record) => record._id.toString() === id) ?? null;
	}

	async findAll(query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]> {
		let found = [...this.collection];
		if (filter?.status !== undefined) {
			found = found.filter((record) => record.status === filter.status);
		}
		return paginate(sortComments(found, query.sort), query);
	}

	async findByUser(userId: string, query: CommentListQuery): Promise<Comment[]> {
		const found = this.collection.filter((record) => record.user_id === userId);
		return paginate(sortComments(found, query.sort), query);
	}

	async findByDrink(drinkId: string, query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]> {
		let found = this.collection.filter((record) => record.drink_id === drinkId);
		if (filter?.status !== undefined) {
			found = found.filter((record) => record.status === filter.status);
		}
		return paginate(sortComments(found, query.sort), query);
	}

	async deleteByUser(userId: string): Promise<number> {
		const initialLength = this.collection.length;
		this.collection = this.collection.filter((record) => record.user_id !== userId);
		return initialLength - this.collection.length;
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		const initialLength = this.collection.length;
		this.collection = this.collection.filter((record) => record.drink_id !== drinkId);
		return initialLength - this.collection.length;
	}
}
