import { Schema, model, models } from 'mongoose';
import { IUserToken } from '@modules/accounts/entities/userToken.entity';
import authConfig from '@config/auth';

export const IUserTokenSchema = new Schema<IUserToken>(
	{
		user_id: { type: String, required: true },
		refresh_token: { type: String, required: true, unique: true },
		expires_date: { type: Date, required: true },
		created_at: { type: Date, expires: authConfig.expires_refresh_token_seconds }
	},
	{
		toJSON: {
			transform: (_, ret) => {
				delete ret.__v;
			}
		},
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		}
	}
);

export const UserToken = models['users-tokens'] || model<IUserToken>('users-tokens', IUserTokenSchema);
