import mongoose, { Model, Schema } from 'mongoose';
import { Credential } from '@/core/accounts/entities/credential.entity';

export const CREDENTIAL_USER_ID_UNIQUE_INDEX = 'credential_user_id_unique';
export const CREDENTIAL_UNIQUE_INDEXES = [CREDENTIAL_USER_ID_UNIQUE_INDEX] as const;

export const CredentialSchema = new Schema<Credential>(
	{
		user_id: { type: String, required: true },
		password_hash: { type: String, required: true },
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

CredentialSchema.index({ user_id: 1 }, { unique: true, name: CREDENTIAL_USER_ID_UNIQUE_INDEX });

export const CredentialModel =
	(mongoose.models['credentials'] as Model<Credential> | undefined) ??
	mongoose.model<Credential>('credentials', CredentialSchema);
