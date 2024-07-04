import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { ICreateIngredient, IFindIngredientByName, IUpdateIngredient } from '@modules/drinks/dtos/ingredient.dtos';

interface IIngredientsRepository {
	create(data: ICreateIngredient): Promise<IIngredient>;
	update(data: IUpdateIngredient): Promise<IIngredient>;
	delete(id: string): Promise<IIngredient>;
	findByName(data: IFindIngredientByName): Promise<IIngredient | null>;
	findById(id: string): Promise<IIngredient | null>;
	findAll(): Promise<IIngredient[]>;
	findByIdList(ids: string[]): Promise<IIngredient[]>;
}

export { IIngredientsRepository };
