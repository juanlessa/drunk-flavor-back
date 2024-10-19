import { UserPermissionModel } from '../entities/user';

export type UserSubject = [
	'create' | 'delete' | 'list' | 'get' | 'update' | 'manage' | 'test',
	'User' | UserPermissionModel,
];
