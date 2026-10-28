import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_CONTENT_MIN_LENGTH } from '@/core/engagement/constants/comment.constants';
import { CommentStatus, CommentStatuses } from '@/core/engagement/entities/comment.entity';
import mongoose, { Model, Schema, Types } from 'mongoose';

export type CommentPersistence = {
	_id: Types.ObjectId;
	drink_id: string;
	user_id: string;
	content: string;
	status: CommentStatus;
	created_at: Date;
	updated_at: Date;
};

export const CommentSchema = new Schema<CommentPersistence>(
	{
		drink_id: { type: String, required: true, immutable: true },
		user_id: { type: String, required: true, immutable: true },
		content: {
			type: String,
			required: true,
			trim: true,
			minlength: COMMENT_CONTENT_MIN_LENGTH,
			maxlength: COMMENT_CONTENT_MAX_LENGTH,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(CommentStatuses),
			default: CommentStatuses.visible,
		},
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

CommentSchema.index({ status: 1, created_at: -1, _id: -1 }, { name: 'comment_status_created_id' });
CommentSchema.index({ drink_id: 1, status: 1, created_at: -1, _id: -1 }, { name: 'comment_drink_status_created_id' });
CommentSchema.index({ user_id: 1, created_at: -1, _id: -1 }, { name: 'comment_user_created_id' });

export const CommentModel =
	(mongoose.models['comments'] as Model<CommentPersistence> | undefined) ??
	mongoose.model<CommentPersistence>('comments', CommentSchema);
