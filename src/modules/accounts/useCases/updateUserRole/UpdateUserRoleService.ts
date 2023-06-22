import { IUpdateUser } from '@modules/accounts/dtos/Users';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const requestSchema = z.object({
	userId: z.string().length(24, { message: 'User does not exist' }),
	role: z.string().min(1, { message: 'Role is required' })
});

type IRequest = z.infer<typeof requestSchema>;

@injectable()
class UpdateUserRoleService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}
	async execute(data: IRequest): Promise<void> {
		const result = requestSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IRequest>;
			throw new AppError(error.issues[0].message);
		}
		const { userId, role } = result.data;

		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new AppError('User does not exist');
		}

		user.role = role;

		await this.usersRepository.update(user);
	}
}

export { UpdateUserRoleService };
