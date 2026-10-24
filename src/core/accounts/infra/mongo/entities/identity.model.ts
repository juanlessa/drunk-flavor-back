import mongoose, { Model, Schema } from 'mongoose';
import { Identity, IdentityProviders } from '@/core/accounts/entities/identity.entity';

export const IDENTITY_PROVIDER_SUB_UNIQUE_INDEX = 'identity_provider_sub_unique';
export const IDENTITY_UNIQUE_INDEXES = [IDENTITY_PROVIDER_SUB_UNIQUE_INDEX] as const;

export const IdentitySchema = new Schema<Identity>(
	{
		user_id: { type: String, required: true },
		provider: { type: String, required: true, enum: Object.values(IdentityProviders) },
		provider_sub: { type: String, required: true },
		email: { type: String, required: false, lowercase: true },
		email_verified: { type: Boolean, required: false },
		picture: { type: String, required: false },
		last_login_at: { type: Date, required: false },
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

IdentitySchema.index({ provider: 1, provider_sub: 1 }, { unique: true, name: IDENTITY_PROVIDER_SUB_UNIQUE_INDEX });
IdentitySchema.index({ user_id: 1 }, { name: 'identity_user_id' });

export const IdentityModel =
	(mongoose.models['identities'] as Model<Identity> | undefined) ??
	mongoose.model<Identity>('identities', IdentitySchema);
