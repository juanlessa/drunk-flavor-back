import { Schema, model } from 'mongoose';
import { IUserToken } from '@modules/accounts/entities/userToken.entity';

export const IUserTokenSchema = new Schema<IUserToken>(
	{
		user_id: { type: String, required: true },
		refresh_token: { type: String, required: true, unique: true },
		expires_date: { type: Date, required: true }
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

export const UserToken = model<IUserToken>('users-tokens', IUserTokenSchema);
