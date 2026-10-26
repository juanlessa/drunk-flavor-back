import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { DrinksModule } from '@/core/drinks/public/DrinksModule';
import { IDrinksModule } from '@/shared/providers/moduleCommunication/drinks';

const drinksModule: IDrinksModule = new DrinksModule(resolveDrinksRepository());

export const resolveDrinksModule = () => drinksModule;
