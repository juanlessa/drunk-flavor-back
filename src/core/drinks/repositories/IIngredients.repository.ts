import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';

export interface IIngredientsRepository {
	create(data: CreateIngredient): Promise<Ingredient>;
	update(data: UpdateIngredient): Promise<Ingredient>;
	delete(id: string): Promise<Ingredient>;
	findByName(data: FindIngredientByName): Promise<Ingredient | null>;
	findById(id: string): Promise<Ingredient | null>;
	findAll(): Promise<Ingredient[]>;
	findByIdList(ids: string[]): Promise<Ingredient[]>;
}
