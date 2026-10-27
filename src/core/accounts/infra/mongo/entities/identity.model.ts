import mongoose, { InferRawDocType, Model, Schema } from 'mongoose';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';

export const IDENTITY_PROVIDER_SUB_UNIQUE_INDEX = 'identity_provider_sub_unique';
export const IDENTITY_USER_PROVIDER_UNIQUE_INDEX = 'identity_user_provider_unique';
export const IDENTITY_UNIQUE_INDEXES = [
	IDENTITY_PROVIDER_SUB_UNIQUE_INDEX,
	IDENTITY_USER_PROVIDER_UNIQUE_INDEX,
] as const;

const identitySchemaDefinition = {
	user_id: { type: String, required: true },
	provider: { type: String, required: true, enum: Object.values(IdentityProviders) },
	provider_sub: { type: String, required: true },
	email: { type: String, required: false, lowercase: true },
	email_verified: { type: Boolean, required: false },
	picture_url: { type: String, required: false },
	last_login_at: { type: Date, required: false },
} as const;

/** Raw identity representation persisted by MongoDB. */
export type IdentityPersistence = InferRawDocType<typeof identitySchemaDefinition> & {
	created_at: Date;
	updated_at: Date;
};

export const IdentitySchema = new Schema<IdentityPersistence>(identitySchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

IdentitySchema.index({ provider: 1, provider_sub: 1 }, { unique: true, name: IDENTITY_PROVIDER_SUB_UNIQUE_INDEX });
IdentitySchema.index({ user_id: 1, provider: 1 }, { unique: true, name: IDENTITY_USER_PROVIDER_UNIQUE_INDEX });

export const IdentityModel =
	(mongoose.models['identities'] as Model<IdentityPersistence> | undefined) ??
	mongoose.model<IdentityPersistence>('identities', IdentitySchema);
