import { Drink } from '@/core/drinks/entities/drink.entity';
import { CreateDrink, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { FindIngredientByName } from '@/core/drinks/dtos/ingredient.dtos';

export interface IDrinksRepository {
	create(data: CreateDrink): Promise<Drink>;
	update(data: UpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(data: FindIngredientByName): Promise<Drink | null>;
	findById(id: string): Promise<Drink | null>;
	findAll(): Promise<Drink[]>;
}
