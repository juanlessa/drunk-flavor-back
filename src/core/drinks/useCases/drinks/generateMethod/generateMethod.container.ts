import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { GenerateMethodService } from './GenerateMethod.service';

const ingredientsRepository = resolveIngredientsRepository();
const generateMethodService = new GenerateMethodService(ingredientsRepository);

export const resolveGenerateMethodService = () => generateMethodService;
