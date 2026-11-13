import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { ValidateSessionRenewalService } from './ValidateSessionRenewal.service';

const usersRepository = resolveUsersRepository();

const validateSessionRenewalService = new ValidateSessionRenewalService(usersRepository);

export const resolveValidateSessionRenewalService = () => validateSessionRenewalService;
