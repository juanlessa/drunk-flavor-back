import {
	CommentListQuery,
	CommentVisibilityFilter,
	CreateComment,
	UpdateComment,
	UpdateCommentStatus,
} from '@/core/engagement/dtos/comment.dtos';
import { Comment } from '@/core/engagement/entities/comment.entity';

export interface ICommentsRepository {
	create(data: CreateComment): Promise<Comment>;
	update(data: UpdateComment): Promise<Comment>;
	updateStatus(data: UpdateCommentStatus): Promise<Comment>;
	delete(id: string): Promise<Comment>;
	findById(id: string): Promise<Comment | null>;
	findAll(query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]>;
	findByUser(userId: string, query: CommentListQuery): Promise<Comment[]>;
	findByDrink(drinkId: string, query: CommentListQuery, filter?: CommentVisibilityFilter): Promise<Comment[]>;
	deleteByUser(userId: string): Promise<number>;
	deleteByDrink(drinkId: string): Promise<number>;
}
