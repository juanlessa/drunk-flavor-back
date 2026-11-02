import mongoose, { Model, Schema, Types } from 'mongoose';

export const RATING_DRINK_USER_UNIQUE_INDEX = 'rating_drink_user_unique';

export type RatingPersistence = {
	_id: Types.ObjectId;
	drink_id: string;
	user_id: string;
	value: number;
	created_at: Date;
	updated_at: Date;
};

export const RatingSchema = new Schema<RatingPersistence>(
	{
		drink_id: { type: String, required: true, immutable: true },
		user_id: { type: String, required: true, immutable: true },
		value: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
			validate: {
				validator: Number.isInteger,
				message: 'Rating value must be an integer',
			},
		},
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

RatingSchema.index({ drink_id: 1, user_id: 1 }, { unique: true, name: RATING_DRINK_USER_UNIQUE_INDEX });
RatingSchema.index({ created_at: -1, _id: -1 }, { name: 'rating_created_id' });
RatingSchema.index({ drink_id: 1, created_at: -1, _id: -1 }, { name: 'rating_drink_created_id' });
RatingSchema.index({ user_id: 1, created_at: -1, _id: -1 }, { name: 'rating_user_created_id' });

export const RatingModel =
	(mongoose.models['ratings'] as Model<RatingPersistence> | undefined) ??
	mongoose.model<RatingPersistence>('ratings', RatingSchema);
