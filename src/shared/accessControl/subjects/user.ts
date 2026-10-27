import { UserPermissionModel } from '../entities/user';

export type UserAdministrationAction =
	| 'create'
	| 'delete'
	| 'list'
	| 'get'
	| 'update'
	| 'changeRole'
	| 'suspend'
	| 'reactivate'
	| 'transferOwnership'
	| 'manage';

export type UserSubject = [UserAdministrationAction, 'User' | UserPermissionModel];
