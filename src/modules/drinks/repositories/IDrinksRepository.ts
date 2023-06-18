import Drink from '@modules/drinks/entities/Drink';
import { ICreateDrink, IDrinkResponse, IUpdateDrink } from '@modules/drinks/dtos/Drinks';
interface IDrinksRepository {
	create(data: ICreateDrink): Promise<Drink>;
	update(data: IUpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(name: string): Promise<Drink>;
	findById(id: string): Promise<Drink>;
	findAll(): Promise<Drink[]>;
	findByNameWithIngredientsDetails(name: string): Promise<IDrinkResponse[]>;
	findByIdWithIngredientsDetails(id: string): Promise<IDrinkResponse[]>;
	findAllWithIngredientsDetails(): Promise<IDrinkResponse[]>;
	removeDeletedIngredient(deletedIngredientId: string): Promise<void>;
}

export { IDrinksRepository };
