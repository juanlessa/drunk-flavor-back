import { docsCreateUser } from '@modules/accounts/useCases/createUser/createUser.docs';
import { docsDeleteUser } from '@modules/accounts/useCases/deleteUser/deleteUser.docs';
import { docsListUsers } from '@modules/accounts/useCases/listUsers/listUsers.docs';
import { docsProfileUser } from '@modules/accounts/useCases/profileUser/ProfileUser.docs';
import { docsUpdateUser } from '@modules/accounts/useCases/updateUser/updateUser.docs';
import { docsUpdateUserRole } from '@modules/accounts/useCases/updateUserRole/updateUserRole.docs';

export const docsUsersPath = {
	'/users': {
		post: docsCreateUser,
		delete: docsDeleteUser,
		get: docsListUsers,
		patch: docsUpdateUser
	},
	'/users/profile': {
		get: docsProfileUser
	},
	'/users/role': {
		patch: docsUpdateUserRole
	}
};
