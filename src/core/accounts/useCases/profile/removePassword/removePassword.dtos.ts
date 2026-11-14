import { User } from '@/core/accounts/entities/user.entity';

export type RemovePasswordCommand = {
	userId: string;
};

export type RemovePasswordResult = {
	user: Pick<User, 'id' | 'role' | 'status' | 'sessionVersion'>;
};
