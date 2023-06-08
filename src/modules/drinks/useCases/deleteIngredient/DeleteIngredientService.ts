import { inject, injectable } from "tsyringe";
import { SafeParseError, z } from 'zod';
import {IIngredientsRepository} from '@modules/drinks/repositories/IIngredientsRepository'
import AppError from "@shared/errors/AppError";
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";

const deleteIngredientSchema = z.object({
    id: z.string({required_error: "Ingredient id is required"}).length(24, {message: "Ingredient does not exist."}),
})
type IDeleteIngredient = z.infer<typeof deleteIngredientSchema>


@injectable()
class DeleteIngredientService {
    constructor(
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository,
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
    ) {}
    async execute(data: IDeleteIngredient): Promise<void> {
               
        const result = deleteIngredientSchema.safeParse(data)
        if(!result.success){
            const { error } = result as SafeParseError<IDeleteIngredient>; 
            throw new AppError(error.issues[0].message)
        }
        const { id } = result.data

 
        const ingredientExists = await this.ingredientsRepository.findById(id);

        if (!ingredientExists) {
           throw new AppError("Ingredient does not exist");
        }
        
        await this.ingredientsRepository.delete(id);
        await this.drinksRepository.removeDeletedIngredient(id)

    }
}

export { DeleteIngredientService };