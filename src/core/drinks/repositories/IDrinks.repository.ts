import { Drink } from '@/core/drinks/entities/drink.entity';
import { CreateDrink, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { FindDrinkByName } from '@/core/drinks/dtos/drink.dtos';
import { QueryParams } from '@/shared/types/query.types';

export interface IDrinksRepository {
	create(data: CreateDrink): Promise<Drink>;
	update(data: UpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(data: FindDrinkByName): Promise<Drink | null>;
	findById(id: string): Promise<Drink | null>;
	findAll(query: QueryParams): Promise<Drink[]>;
}
