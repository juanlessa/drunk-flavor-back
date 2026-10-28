import mongoose, { InferRawDocType, Model, Schema } from 'mongoose';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';

export const OWNERSHIP_TRANSFER_SCOPE_UNIQUE_INDEX = 'ownership_transfer_scope_unique';
export const OWNERSHIP_TRANSFER_TOKEN_UNIQUE_INDEX = 'ownership_transfer_token_unique';
export const OWNERSHIP_TRANSFER_EXPIRES_AT_TTL_INDEX = 'ownership_transfer_expires_at_ttl';

const ownershipTransferInvitationSchemaDefinition = {
	scope: {
		type: String,
		required: true,
		enum: [OWNERSHIP_TRANSFER_INVITATION_SCOPE],
		default: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
	},
	current_owner_id: { type: String, required: true },
	target_user_id: { type: String, required: true },
	token_hash: { type: String, required: true },
	reason: { type: String, required: true },
	owner_session_version: { type: Number, required: true, min: 1, validate: Number.isInteger },
	target_session_version: { type: Number, required: true, min: 1, validate: Number.isInteger },
	expires_at: { type: Date, required: true },
} as const;

export type OwnershipTransferInvitationPersistence = InferRawDocType<
	typeof ownershipTransferInvitationSchemaDefinition
> & {
	created_at: Date;
	updated_at: Date;
};

export const OwnershipTransferInvitationSchema = new Schema<OwnershipTransferInvitationPersistence>(
	ownershipTransferInvitationSchemaDefinition,
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

OwnershipTransferInvitationSchema.index({ scope: 1 }, { unique: true, name: OWNERSHIP_TRANSFER_SCOPE_UNIQUE_INDEX });
OwnershipTransferInvitationSchema.index(
	{ token_hash: 1 },
	{ unique: true, name: OWNERSHIP_TRANSFER_TOKEN_UNIQUE_INDEX },
);
OwnershipTransferInvitationSchema.index(
	{ expires_at: 1 },
	{ expireAfterSeconds: 0, name: OWNERSHIP_TRANSFER_EXPIRES_AT_TTL_INDEX },
);

export const OwnershipTransferInvitationModel =
	(mongoose.models['ownership_transfer_invitations'] as Model<OwnershipTransferInvitationPersistence> | undefined) ??
	mongoose.model<OwnershipTransferInvitationPersistence>(
		'ownership_transfer_invitations',
		OwnershipTransferInvitationSchema,
	);
