import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '../dtos/user.dtos';

export const createUserFactory = (user?: DeepPartial<CreateUser>): CreateUser & { name: string; surname: string } => ({
	name: user?.name || 'John',
	surname: user?.surname || 'Doe',
	email: user?.email || 'johndoe@example.com',
	emailVerified: user?.emailVerified ?? false,
	avatarUrl: user?.avatarUrl,
	role: user?.role || 'member',
	status: user?.status || 'active',
});
