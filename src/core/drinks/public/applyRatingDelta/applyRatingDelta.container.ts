import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { ApplyRatingDeltaService } from './ApplyRatingDelta.service';

const applyRatingDeltaService = new ApplyRatingDeltaService(resolveDrinksRepository());

export const resolveApplyRatingDeltaService = () => applyRatingDeltaService;
