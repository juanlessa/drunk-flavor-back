import mongoose, { Model, Schema } from 'mongoose';
import { TokenTypes, Token } from '@/core/accounts/entities/token.entity';

export const TOKEN_UNIQUE_INDEX = 'token_unique';
export const TOKEN_USER_TYPE_UNIQUE_INDEX = 'token_user_id_type_unique';
export const TOKEN_EXPIRES_AT_TTL_INDEX = 'token_expires_at_ttl';
export const TOKEN_UNIQUE_INDEXES = [TOKEN_UNIQUE_INDEX, TOKEN_USER_TYPE_UNIQUE_INDEX] as const;

export const TokenSchema = new Schema<Token>(
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

TokenSchema.index({ token: 1 }, { unique: true, name: TOKEN_UNIQUE_INDEX });
TokenSchema.index({ user_id: 1, type: 1 }, { unique: true, name: TOKEN_USER_TYPE_UNIQUE_INDEX });
TokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0, name: TOKEN_EXPIRES_AT_TTL_INDEX });

export const TokenModel =
	(mongoose.models['tokens'] as Model<Token> | undefined) ?? mongoose.model<Token>('tokens', TokenSchema);
