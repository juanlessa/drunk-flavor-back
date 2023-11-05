import { IDrink } from '@modules/drinks/entities/drink.entity';
import { ICreateDrink, IUpdateDrink } from '@modules/drinks/dtos/drink.dtos';
import { IFindIngredientByName } from '@modules/drinks/dtos/ingredient.dtos';

export interface IDrinksRepository {
	create(data: ICreateDrink): Promise<IDrink>;
	update(data: IUpdateDrink): Promise<IDrink>;
	delete(id: string): Promise<IDrink>;
	findByName(data: IFindIngredientByName): Promise<IDrink | null>;
	findById(id: string): Promise<IDrink | null>;
	findAll(): Promise<IDrink[]>;
}
