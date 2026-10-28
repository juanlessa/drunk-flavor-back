import { UserPermissionModel } from '../entities/user';

export type UserAdministrationAction =
	| 'create'
	| 'delete'
	| 'list'
	| 'get'
	| 'changeRole'
	| 'suspend'
	| 'reactivate'
	| 'close'
	| 'transferOwnership'
	| 'manage';

export type UserSubject = [UserAdministrationAction, 'User' | UserPermissionModel];
