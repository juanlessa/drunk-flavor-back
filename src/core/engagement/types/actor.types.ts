import { UserPermissionModel } from '@/shared/accessControl/entities/user';

export type EngagementActor = Pick<UserPermissionModel, 'id' | 'role'>;
