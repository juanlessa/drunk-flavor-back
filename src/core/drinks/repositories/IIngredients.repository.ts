import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { QueryParams } from '@/shared/types/query.types';

export interface IIngredientsRepository {
	create(data: CreateIngredient): Promise<Ingredient>;
	update(data: UpdateIngredient): Promise<Ingredient>;
	delete(id: string): Promise<Ingredient>;
	findByName(data: FindIngredientByName): Promise<Ingredient | null>;
	findById(id: string): Promise<Ingredient | null>;
	/** With `onlyIds`, only the ingredients among those ids are listed, and the search, sort and pagination apply to them. */
	findAll(query: QueryParams, onlyIds?: string[]): Promise<Ingredient[]>;
	/** Like `findAll`, with the records created by `userId` first and the others after, each group in the order of the query. */
	findAllOwnedFirst(query: QueryParams, userId: string): Promise<Ingredient[]>;
	/** Removes the user as creator and last editor of the records, which stay as they are. Returns how many were touched. */
	clearCreatorByUser(userId: string): Promise<number>;
	findByIdList(ids: string[]): Promise<Ingredient[]>;
}
