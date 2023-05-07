import { Prisma } from '@prisma/client'
import { inject, injectable } from "tsyringe";
import { z} from 'zod';
import { IIngredientsRepository } from "@modules/drinks/repositories/IIngredientsRepository";
import AppError from '@shared/errors/AppError';

const ingredientSchema = z.object({
    name: z.string(),
    unity: z.string(),
    category: z.string(),
    isAlcoholic: z.boolean(),
    colorTheme: z.string()
}) 

type Ingredient = z.infer<typeof ingredientSchema>

@injectable()
class CreateIngredientService {
    constructor(
        @inject("IngredientsRepository")
        private ingredientsRepository: IIngredientsRepository
    ) {}

    async execute(data:Ingredient): Promise<Ingredient> {
        
        const {name, unity, category, isAlcoholic, colorTheme } = ingredientSchema.parse(data)

        const ingredientALreadyExists = await this.ingredientsRepository.findByName(name);
        
        console.log("ingredient exists");
        console.log(ingredientALreadyExists);
        console.log(ingredientALreadyExists? true: false );
        
        if (ingredientALreadyExists.length === 1) {
            throw new AppError("Ingredient already exists!");            
        }

        const ingredient = await this.ingredientsRepository.create({name, unity, category, isAlcoholic, colorTheme });

        return ingredient;
    }
}

export { CreateIngredientService };