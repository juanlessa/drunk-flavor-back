import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveCleanupQueueProvider } from '@/shared/providers/queue/cleanup';
import { DeleteDrinkService } from './DeleteDrink.service';

const drinksRepository = resolveDrinksRepository();
const cleanupQueueProvider = resolveCleanupQueueProvider();

const deleteDrinkService = new DeleteDrinkService(drinksRepository, cleanupQueueProvider);

export const resolveDeleteDrinkService = () => deleteDrinkService;
