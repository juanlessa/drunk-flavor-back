import { Prisma } from '@prisma/client'
import { inject, injectable } from "tsyringe";
import { IIngredientsRepository } from "@modules/drinks/repositories/IIngredientsRepository";


type Ingredient = Prisma.IngredientCreateInput

@injectable()
class ListIngredientsService {
    constructor(
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository
    ) {}

    async execute(): Promise<Ingredient[]> {    
        const ingredients = await this.ingredientsRepository.findAll();        
    
        return ingredients;
    }
}

export { ListIngredientsService };