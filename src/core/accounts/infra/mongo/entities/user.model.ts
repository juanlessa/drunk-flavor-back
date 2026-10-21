import mongoose, { Model, Schema } from 'mongoose';
import { User, UserStatuses } from '@/core/accounts/entities/user.entity';
import { Roles } from '@/shared/accessControl/roles';

export const UserSchema = new Schema<User>(
	{
		name: { type: String, required: true },
		surname: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		role: { type: String, default: Roles.member, enum: Object.values(Roles) },
		status: { type: String, default: UserStatuses.idle, enum: Object.values(UserStatuses) },
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

export const UserModel =
	(mongoose.models['users'] as Model<User> | undefined) ?? mongoose.model<User>('users', UserSchema);
