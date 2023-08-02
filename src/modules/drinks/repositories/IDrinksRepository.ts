import Drink from '@modules/drinks/entities/Drink';
import { ICreateDrink, IUpdateDrink } from '@modules/drinks/dtos/Drinks';

interface IDrinksRepository {
	create(data: ICreateDrink): Promise<Drink>;
	update(data: IUpdateDrink): Promise<Drink>;
	delete(id: string): Promise<Drink>;
	findByName(name: string): Promise<Drink>;
	findById(id: string): Promise<Drink>;
	findAll(): Promise<Drink[]>;
	findByNameWithIngredientsDetails(name: string): Promise<Drink>;
	findByIdWithIngredientsDetails(id: string): Promise<Drink>;
	findAllWithIngredientsDetails(): Promise<Drink[]>;
}

export { IDrinksRepository };
