import { inject, injectable } from "tsyringe";
import {IIngredientsRepository} from '@modules/drinks/repositories/IIngredientsRepository'
import AppError from "@shared/errors/AppError";
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";


@injectable()
class DeleteIngredientService {
    constructor(
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository,
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
    ) {}
    async execute(id: string): Promise<void> {
        const ingredientExists = await this.ingredientsRepository.findById(id);

        if (!ingredientExists) {
           throw new AppError("Ingredient does not exist");
        }
        
        await this.ingredientsRepository.delete(id);
        await this.drinksRepository.removeDeletedIngredient(id)

    }
}

export { DeleteIngredientService };