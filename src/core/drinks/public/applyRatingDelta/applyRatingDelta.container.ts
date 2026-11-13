import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { ApplyRatingDeltaService } from './ApplyRatingDelta.service';

const drinksRepository = resolveDrinksRepository();

const applyRatingDeltaService = new ApplyRatingDeltaService(drinksRepository);

export const resolveApplyRatingDeltaService = () => applyRatingDeltaService;
