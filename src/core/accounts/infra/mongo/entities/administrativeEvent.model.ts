import mongoose, { InferRawDocType, Model, Schema } from 'mongoose';
import {
	AdministrativeEventActions,
	AdministrativeEventOrigins,
} from '@/core/accounts/entities/administrativeEvent.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { Roles } from '@/shared/accessControl/roles';

export const ADMINISTRATIVE_EVENT_RETENTION_SECONDS = 60 * 60 * 24 * 730;
export const ADMINISTRATIVE_EVENT_OCCURRED_AT_TTL_INDEX = 'administrative_event_occurred_at_ttl';

const eventStateSchema = new Schema(
	{
		role: { type: String, required: false, enum: Object.values(Roles) },
		status: { type: String, required: false, enum: Object.values(UserStatuses) },
	},
	{ _id: false },
);

const administrativeEventSchemaDefinition = {
	actor_id: { type: String, required: true },
	target_user_id: { type: String, required: true },
	action: { type: String, required: true, enum: Object.values(AdministrativeEventActions) },
	before: { type: eventStateSchema, required: false },
	after: { type: eventStateSchema, required: false },
	origin: { type: String, required: true, enum: Object.values(AdministrativeEventOrigins) },
	request_id: { type: String, required: false },
	reason: { type: String, required: false },
	occurred_at: { type: Date, required: true, default: Date.now },
} as const;

export type AdministrativeEventPersistence = InferRawDocType<typeof administrativeEventSchemaDefinition>;

export const AdministrativeEventSchema = new Schema<AdministrativeEventPersistence>(
	administrativeEventSchemaDefinition,
	{ versionKey: false },
);

AdministrativeEventSchema.index(
	{ occurred_at: 1 },
	{
		expireAfterSeconds: ADMINISTRATIVE_EVENT_RETENTION_SECONDS,
		name: ADMINISTRATIVE_EVENT_OCCURRED_AT_TTL_INDEX,
	},
);

export const AdministrativeEventModel =
	(mongoose.models['administrative_events'] as Model<AdministrativeEventPersistence> | undefined) ??
	mongoose.model<AdministrativeEventPersistence>('administrative_events', AdministrativeEventSchema);
