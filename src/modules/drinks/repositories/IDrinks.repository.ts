import { Drink } from '@/modules/drinks/entities/drink.entity';
import { CreateDrink, UpdateDrink } from '@/modules/drinks/dtos/drink.dtos';
import { FindIngredientByName } from '@/modules/drinks/dtos/ingredient.dtos';

export interface IDrinksRepository {
	create(data: CreateDrink): Promise<Drink>;
	update(data: UpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(data: FindIngredientByName): Promise<Drink | null>;
	findById(id: string): Promise<Drink | null>;
	findAll(): Promise<Drink[]>;
}
