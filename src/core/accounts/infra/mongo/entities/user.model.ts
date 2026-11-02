import mongoose, { InferRawDocType, Model, Schema } from 'mongoose';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { Roles } from '@/shared/accessControl/roles';
import { isProfileNameRequired } from '@/core/accounts/infra/mongo/helpers/user.helpers';

export const USER_EMAIL_UNIQUE_INDEX = 'user_email_unique';
export const USER_OWNER_UNIQUE_INDEX = 'user_owner_unique';
export const USER_UNIQUE_INDEXES = [USER_EMAIL_UNIQUE_INDEX, USER_OWNER_UNIQUE_INDEX] as const;

const userSchemaDefinition = {
	name: {
		type: String,
		required: isProfileNameRequired,
	},
	surname: {
		type: String,
		required: isProfileNameRequired,
	},
	email: {
		type: String,
		required: true,
		lowercase: true,
	},
	email_verified: {
		type: Boolean,
		required: true,
		default: false,
	},
	avatar_url: {
		type: String,
		required: false,
	},
	role: {
		type: String,
		default: Roles.member,
		enum: Object.values(Roles),
	},
	status: {
		type: String,
		default: UserStatuses.idle,
		enum: Object.values(UserStatuses),
	},
	session_version: {
		type: Number,
		required: true,
		default: 1,
		min: 1,
		validate: Number.isInteger,
	},
} as const;

/**
 * Raw user representation persisted by MongoDB. Its schema fields are inferred
 * from `userSchemaDefinition`. Compatible with lean() return type
 */
export type UserPersistence = InferRawDocType<typeof userSchemaDefinition> & {
	created_at: Date;
	updated_at: Date;
};

export const UserSchema = new Schema<UserPersistence>(userSchemaDefinition, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
});

UserSchema.index({ email: 1 }, { unique: true, name: USER_EMAIL_UNIQUE_INDEX });
UserSchema.index(
	{ role: 1 },
	{
		unique: true,
		name: USER_OWNER_UNIQUE_INDEX,
		partialFilterExpression: { role: Roles.owner },
	},
);

export const UserModel =
	(mongoose.models['users'] as Model<UserPersistence> | undefined) ??
	mongoose.model<UserPersistence>('users', UserSchema);
