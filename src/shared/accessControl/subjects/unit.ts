import { UnitPermissionModel } from '../entities/unit';

export type UnitSubject = ['create' | 'delete' | 'list' | 'get' | 'update' | 'manage', 'Unit' | UnitPermissionModel];
