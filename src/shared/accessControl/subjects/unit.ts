import { UnitPermissionModel } from '../entities/unit';

export type UnitSubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'getWithAuthorship' | 'update' | 'manage',
	'Unit' | UnitPermissionModel,
];
