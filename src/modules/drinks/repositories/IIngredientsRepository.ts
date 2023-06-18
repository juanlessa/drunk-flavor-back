import Ingredient from '@modules/drinks/entities/Ingredient';
import { ICreateIngredient, IUpdateIngredient } from '@modules/drinks/dtos/ingredients';
interface IIngredientsRepository {
	create(data: ICreateIngredient): Promise<Ingredient>;
	update(data: IUpdateIngredient): Promise<Ingredient>;
	delete(id: string): Promise<Ingredient>;
	findByName(name: string): Promise<Ingredient>;
	findById(id: string): Promise<Ingredient>;
	findAll(): Promise<Ingredient[]>;
	findByIdList(ids: string[]): Promise<Ingredient[]>;
}

export { IIngredientsRepository };
