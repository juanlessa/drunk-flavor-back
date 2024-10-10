import { resolveUsersRepository } from '@/core/accounts/container';
import { ResetUserPasswordService } from './resetUserPassword.service';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import { resolveTemplateProvider } from '@/shared/providers/template';

const mailerProvider = resolveMailerProvider();
const templateProvider = resolveTemplateProvider();
const usersRepository = resolveUsersRepository();

const resetUserPasswordService = new ResetUserPasswordService(usersRepository, mailerProvider, templateProvider);
export const resolveResetUserPasswordService = () => resetUserPasswordService;
