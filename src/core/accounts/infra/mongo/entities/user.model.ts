import mongoose, { Schema } from 'mongoose';
import { User, UserRolesEnum, UserStatusEnum } from '@/core/accounts/entities/user.entity';

export const UserSchema = new Schema<User>(
	{
		name: { type: String, required: true },
		surname: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		role: { type: String, default: UserRolesEnum.member, enum: UserRolesEnum },
		status: { type: String, default: UserStatusEnum.idle, enum: UserStatusEnum },
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

export const UserModel = mongoose.models['users'] || mongoose.model<User>('users', UserSchema);
