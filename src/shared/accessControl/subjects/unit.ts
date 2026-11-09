import { UnitPermissionModel } from '../entities/unit';

export type UnitSubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'update' | 'manage',
	'Unit' | UnitPermissionModel,
];
