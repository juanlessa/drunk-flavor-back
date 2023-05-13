import { Prisma } from '@prisma/client'
import { inject, injectable } from "tsyringe";
import { IIngredientsRepository } from "@modules/drinks/repositories/IIngredientsRepository";


type Ingredient = Prisma.IngredientCreateInput

@injectable()
class GetIngredientService {
    constructor(
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository
    ) {}

    async execute(id: string): Promise<Ingredient> {    
        const ingredient = await this.ingredientsRepository.findById(id);        
    
        return ingredient;
    }
}

export { GetIngredientService };