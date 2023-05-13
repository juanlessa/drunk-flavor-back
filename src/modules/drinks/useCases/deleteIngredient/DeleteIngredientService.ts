import { inject, injectable } from "tsyringe";
import {IIngredientsRepository} from '@modules/drinks/repositories/IIngredientsRepository'
import AppError from "@shared/errors/AppError";


@injectable()
class DeleteIngredientService {
    constructor(
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository
    ) {}
    async execute(id: string): Promise<void> {
        const ingredientExists = await this.ingredientsRepository.findById(id);

        if (!ingredientExists) {
           throw new AppError("Ingredient does not exist");
        }
        
        await this.ingredientsRepository.delete(id);       
    }
}

export { DeleteIngredientService };