import { Types } from 'mongoose';

export type DatabaseCommonInfo = {
	_id: Types.ObjectId;
	created_at: Date;
	updated_at: Date;
};
