import mongoose, { Model, Schema } from 'mongoose';
import { TokenTypes, UserToken } from '@/core/accounts/entities/userToken.entity';

export const UserTokenSchema = new Schema<UserToken>(
	{
		token: { type: String, required: true, unique: true },
		user_id: { type: String, required: true },
		type: { type: String, required: true, enum: Object.values(TokenTypes) },
		expires_at: { type: Date, required: true },
	},
	{
		toJSON: {
			transform: (_, ret) => {
				Reflect.deleteProperty(ret, '__v');
			},
		},
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

UserTokenSchema.index({ user_id: 1, type: 1 }, { unique: true });
UserTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const UserTokenModel =
	(mongoose.models['users-tokens'] as Model<UserToken> | undefined) ??
	mongoose.model<UserToken>('users-tokens', UserTokenSchema);
