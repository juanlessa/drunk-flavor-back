import {
	CommentListQuery,
	CommentVisibilityFilter,
	CreateComment,
	UpdateComment,
	UpdateCommentStatus,
} from '@/core/engagement/dtos/comment.dtos';
import { Comment } from '@/core/engagement/entities/comment.entity';
import { CommentModel, CommentPersistence } from '@/core/engagement/infra/mongo/entities/comment.model';
import { CommentMapper } from '@/core/engagement/infra/mongo/mappers/comment.mapper';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryFilter } from 'mongoose';

export class CommentsRepository implements ICommentsRepository {
	async create(data: CreateComment): Promise<Comment> {
		const document = await CommentModel.create(CommentMapper.toPersistence(data));
		return CommentMapper.toDomain(document);
	}

	async update({ id, content }: UpdateComment): Promise<Comment> {
		const objectId = CommentMapper.toObjectId(id);
		if (!objectId) throw this.notFound('update');
		const document = await CommentModel.findByIdAndUpdate(
			objectId,
			{ $set: { content } },
			{ returnDocument: 'after', runValidators: true },
		)
			.lean<CommentPersistence>()
			.exec();
		if (!document) throw this.notFound('update');
		return CommentMapper.toDomain(document);
	}

	async updateStatus({ id, status }: UpdateCommentStatus): Promise<Comment> {
		const objectId = CommentMapper.toObjectId(id);
		if (!objectId) throw this.notFound('status update');
		const document = await CommentModel.findByIdAndUpdate(
			objectId,
			{ $set: { status } },
			{ returnDocument: 'after', runValidators: true },
		)
			.lean<CommentPersistence>()
			.exec();
		if (!document) throw this.notFound('status update');
		return CommentMapper.toDomain(document);
	}

	async delete(id: string): Promise<Comment> {
		const objectId = CommentMapper.toObjectId(id);
		if (!objectId) throw this.notFound('delete');
		const document = await CommentModel.findByIdAndDelete(objectId).lean<CommentPersistence>().exec();
		if (!document) throw this.notFound('delete');
		return CommentMapper.toDomain(document);
	}

	async findById(id: string): Promise<Comment | null> {
		const objectId = CommentMapper.toObjectId(id);
		if (!objectId) return null;
		const document = await CommentModel.findById(objectId).lean<CommentPersistence>().exec();
		return document ? CommentMapper.toDomain(document) : null;
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

	private buildFilter(
		base: QueryFilter<CommentPersistence>,
		filter?: CommentVisibilityFilter,
	): QueryFilter<CommentPersistence> {
		return filter?.status === undefined ? base : { ...base, status: filter.status };
	}

	private async runListQuery(filter: QueryFilter<CommentPersistence>, query: CommentListQuery): Promise<Comment[]> {
		const documents = await CommentModel.find(filter)
			.sort(CommentMapper.toPersistenceSort(query.sort))
			.skip((query.page - 1) * query.limit)
			.limit(query.limit)
			.lean<CommentPersistence[]>()
			.exec();
		return documents.map(CommentMapper.toDomain);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.comments.notFound', {
			path: 'Comments.repository',
			cause: `Comment missing during ${operation}`,
		});
	}
}
