import { resolveUsersRepository } from '@modules/accounts/container';
import { ProfileUserService } from '@modules/accounts/useCases/profileUser/ProfileUser.service';

const usersRepository = resolveUsersRepository();

const profileUserService = new ProfileUserService(usersRepository);
export const resolveProfileUserService = () => profileUserService;
