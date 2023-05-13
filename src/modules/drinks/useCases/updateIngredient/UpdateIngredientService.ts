import { inject, injectable } from "tsyringe";
import {IIngredientsRepository} from '@modules/drinks/repositories/IIngredientsRepository'
import AppError from "@shared/errors/AppError";

interface IRequest {
    id: string;
    name: string;
    category: string,
    isAlcoholic: boolean,
    unity: string,
    colorTheme: string
}

@injectable()
class UpdateIngredientService {
    constructor(
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository
    ) {}
    async execute({id, name, category, unity, colorTheme, isAlcoholic}: IRequest): Promise<void> {
        const ingredientExists = await this.ingredientsRepository.findById(id);

        if (!ingredientExists) {
           throw new AppError("Ingredient does not exist")
        }
        
        await this.ingredientsRepository.update({
            id, 
            name, 
            category, 
            unity, 
            colorTheme, 
            isAlcoholic
        })        
    }
}

export { UpdateIngredientService };