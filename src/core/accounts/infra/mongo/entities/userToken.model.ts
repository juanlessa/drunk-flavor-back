import { TokenTypeEnum, UserToken } from '@/core/accounts/entities/userToken.entity';
import { env } from '@/env';
import { Schema, model, models } from 'mongoose';

export const UserTokenSchema = new Schema<UserToken>(
	{
		token: { type: String, required: true, unique: true },
		user_id: { type: String, required: true },
		type: { type: String, required: true, enum: TokenTypeEnum },
		created_at: { type: Date, expires: env.USER_TOKEN_EXPIRES_IN_SECONDS },
	},
	{
		toJSON: {
			transform: (_, ret) => {
				delete ret.__v;
			},
		},
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

export const UserTokenModel = models['users-tokens'] || model<UserToken>('users-tokens', UserTokenSchema);
