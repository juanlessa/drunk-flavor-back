import mongoose, { Model, Schema } from 'mongoose';
import { User } from '@/core/accounts/entities/user.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { Roles } from '@/shared/accessControl/roles';
import { isProfileNameRequired } from '@/core/accounts/infra/mongo/helpers/user.helpers';

export const USER_EMAIL_UNIQUE_INDEX = 'user_email_unique';
export const USER_UNIQUE_INDEXES = [USER_EMAIL_UNIQUE_INDEX] as const;

export const UserSchema = new Schema<User>(
	{
		name: { type: String, required: isProfileNameRequired },
		surname: { type: String, required: isProfileNameRequired },
		email: { type: String, required: true, lowercase: true },
		email_verified: { type: Boolean, required: true, default: false },
		avatar_url: { type: String, required: false },
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

UserSchema.index({ email: 1 }, { unique: true, name: USER_EMAIL_UNIQUE_INDEX });

export const UserModel =
	(mongoose.models['users'] as Model<User> | undefined) ?? mongoose.model<User>('users', UserSchema);
