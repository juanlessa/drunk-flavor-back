import mongoose, { Model, Schema, Types } from 'mongoose';

export const FAVORITE_DRINK_USER_UNIQUE_INDEX = 'favorite_drink_user_unique';

export type FavoritePersistence = {
	_id: Types.ObjectId;
	drink_id: string;
	user_id: string;
	created_at: Date;
};

export const FavoriteSchema = new Schema<FavoritePersistence>(
	{
		drink_id: { type: String, required: true, immutable: true },
		user_id: { type: String, required: true, immutable: true },
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: false } },
);

FavoriteSchema.index({ drink_id: 1, user_id: 1 }, { unique: true, name: FAVORITE_DRINK_USER_UNIQUE_INDEX });
FavoriteSchema.index({ user_id: 1, created_at: -1, _id: -1 }, { name: 'favorite_user_created_id' });

export const FavoriteModel =
	(mongoose.models['favorites'] as Model<FavoritePersistence> | undefined) ??
	mongoose.model<FavoritePersistence>('favorites', FavoriteSchema);
