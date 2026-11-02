import { resolveAccountsModule } from '@/core/accounts/public';
import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { ListCommentsByDrinkService } from './ListCommentsByDrink.service';

const commentsRepository = resolveCommentsRepository();
const accountsModule = resolveAccountsModule();
const listCommentsByDrinkService = new ListCommentsByDrinkService(commentsRepository, accountsModule);

export const resolveListCommentsByDrinkService = () => listCommentsByDrinkService;
