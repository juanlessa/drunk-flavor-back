import { Schema, model, models } from 'mongoose';
import { IUser, UserRolesEnum } from '@/modules/accounts/entities/user.entity';

export const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		surname: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		role: { type: String, default: UserRolesEnum.partner, enum: UserRolesEnum },
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

export const User = models['users'] || model<IUser>('users', UserSchema);
