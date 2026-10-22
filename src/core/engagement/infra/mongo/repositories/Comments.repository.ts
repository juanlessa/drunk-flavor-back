import {
	CommentListQuery,
	CommentVisibilityFilter,
	CreateComment,
	UpdateComment,
	UpdateCommentStatus,
} from '@/core/engagement/dtos/comment.dtos';
import { Comment } from '@/core/engagement/entities/comment.entity';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryFilter } from 'mongoose';

export class CommentsRepository implements ICommentsRepository {
	async create(data: CreateComment): Promise<Comment> {
		return CommentModel.create(data);
	}

	async update({ id, content }: UpdateComment): Promise<Comment> {
		const comment = await CommentModel.findByIdAndUpdate<Comment>(
			id,
			{ $set: { content } },
			{ returnDocument: 'after', runValidators: true },
		).exec();
		if (!comment) {
			throw new NotFoundError('apiResponses.comments.notFound', {
				path: 'Comments.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		return comment;
	}

	async updateStatus({ id, status }: UpdateCommentStatus): Promise<Comment> {
		const comment = await CommentModel.findByIdAndUpdate<Comment>(
			id,
			{ $set: { status } },
			{ returnDocument: 'after', runValidators: true },
		).exec();
		if (!comment) {
			throw new NotFoundError('apiResponses.comments.notFound', {
				path: 'Comments.repository',
				cause: 'Error on findByIdAndUpdate status operation',
			});
		}
		return comment;
	}

	async delete(id: string): Promise<Comment> {
		const comment = await CommentModel.findByIdAndDelete<Comment>(id).exec();
		if (!comment) {
			throw new NotFoundError('apiResponses.comments.notFound', {
				path: 'Comments.repository',
				cause: 'Error on findByIdAndDelete operation',
			});
		}
		return comment;
	}

	async findById(id: string): Promise<Comment | null> {
		return CommentModel.findById<Comment>(id).lean<Comment>({ transform: removeLeanVersionKey }).exec();
	}

	async findAll(query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]> {
		return this.runListQuery(this.buildFilter({}, filter), query);
	}

	async findByUser(userId: string, query: CommentListQuery): Promise<Comment[]> {
		return this.runListQuery({ user_id: userId }, query);
	}

	async findByDrink(drinkId: string, query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]> {
		return this.runListQuery(this.buildFilter({ drink_id: drinkId }, filter), query);
	}

	async deleteByUser(userId: string): Promise<number> {
		const result = await CommentModel.deleteMany({ user_id: userId }).exec();
		return result.deletedCount;
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		const result = await CommentModel.deleteMany({ drink_id: drinkId }).exec();
		return result.deletedCount;
	}

	private buildFilter(base: QueryFilter<Comment>, filter?: CommentVisibilityFilter): QueryFilter<Comment> {
		if (filter?.status !== undefined) {
			return { ...base, status: filter.status };
		}
		return base;
	}

	private runListQuery(filter: QueryFilter<Comment>, query: CommentListQuery): Promise<Comment[]> {
		const skip = (query.page - 1) * query.limit;
		return CommentModel.find(filter)
			.sort(query.sort)
			.skip(skip)
			.limit(query.limit)
			.lean<Comment[]>({ transform: removeLeanVersionKey })
			.exec();
	}
}
