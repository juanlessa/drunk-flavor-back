import { IDrink, IDrinkResponse } from '@modules/drinks/dtos/Drinks';
interface IDrinksRepository {
	create(data: IDrink): Promise<IDrink>;
	update(data: IDrink): Promise<IDrink>;
	delete(id: string): Promise<IDrink>;
	findByName(name: string): Promise<IDrink>;
	findById(id: string): Promise<IDrink>;
	findAll(): Promise<IDrink[]>;
	findByNameWithIngredientsDetails(name: string): Promise<IDrinkResponse[]>;
	findByIdWithIngredientsDetails(id: string): Promise<IDrinkResponse[]>;
	findAllWithIngredientsDetails(): Promise<IDrinkResponse[]>;
	removeDeletedIngredient(deletedIngredientId: string): Promise<void>;
}

export { IDrinksRepository };
