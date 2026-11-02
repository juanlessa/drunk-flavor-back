import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { ValidateSessionRenewalService } from './ValidateSessionRenewal.service';

const validateSessionRenewalService = new ValidateSessionRenewalService(resolveUsersRepository());
export const resolveValidateSessionRenewalService = () => validateSessionRenewalService;
