import mongoose, { Model, Schema } from 'mongoose';
import { TokenTypes, UserToken } from '@/core/accounts/entities/userToken.entity';

export const USER_TOKEN_TOKEN_UNIQUE_INDEX = 'user_token_token_unique';
export const USER_TOKEN_USER_TYPE_UNIQUE_INDEX = 'user_token_user_id_type_unique';
export const USER_TOKEN_EXPIRES_AT_TTL_INDEX = 'user_token_expires_at_ttl';
export const USER_TOKEN_UNIQUE_INDEXES = [USER_TOKEN_TOKEN_UNIQUE_INDEX, USER_TOKEN_USER_TYPE_UNIQUE_INDEX] as const;

export const UserTokenSchema = new Schema<UserToken>(
	{
		token: { type: String, required: true },
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

UserTokenSchema.index({ token: 1 }, { unique: true, name: USER_TOKEN_TOKEN_UNIQUE_INDEX });
UserTokenSchema.index({ user_id: 1, type: 1 }, { unique: true, name: USER_TOKEN_USER_TYPE_UNIQUE_INDEX });
UserTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0, name: USER_TOKEN_EXPIRES_AT_TTL_INDEX });

export const UserTokenModel =
	(mongoose.models['users-tokens'] as Model<UserToken> | undefined) ??
	mongoose.model<UserToken>('users-tokens', UserTokenSchema);
