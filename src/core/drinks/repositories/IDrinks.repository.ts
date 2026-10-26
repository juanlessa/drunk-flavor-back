import { CreateDrink, FindDrinkByName, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { ApplyRatingDelta, DrinkRatingSummary } from '@/shared/providers/moduleCommunication/drinks';
import { QueryParams } from '@/shared/types/query.types';

export interface IDrinksRepository {
	create(data: CreateDrink): Promise<Drink>;
	update(data: UpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(data: FindDrinkByName): Promise<Drink | null>;
	findById(id: string): Promise<Drink | null>;
	findAll(query: QueryParams): Promise<Drink[]>;
	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary>;
}
