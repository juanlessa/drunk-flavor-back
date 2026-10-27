import mongoose, { InferRawDocType, Model, Schema } from 'mongoose';

export const CREDENTIAL_USER_ID_UNIQUE_INDEX = 'credential_user_id_unique';
export const CREDENTIAL_UNIQUE_INDEXES = [CREDENTIAL_USER_ID_UNIQUE_INDEX] as const;

const credentialSchemaDefinition = {
	user_id: { type: String, required: true },
	password_hash: { type: String, required: true },
} as const;

/** Raw credential representation persisted by MongoDB. */
export type CredentialPersistence = InferRawDocType<typeof credentialSchemaDefinition> & {
	created_at: Date;
	updated_at: Date;
};

export const CredentialSchema = new Schema<CredentialPersistence>(credentialSchemaDefinition, {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

CredentialSchema.index({ user_id: 1 }, { unique: true, name: CREDENTIAL_USER_ID_UNIQUE_INDEX });

export const CredentialModel =
	(mongoose.models['credentials'] as Model<CredentialPersistence> | undefined) ??
	mongoose.model<CredentialPersistence>('credentials', CredentialSchema);
