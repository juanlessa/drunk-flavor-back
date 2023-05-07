import { Prisma } from '@prisma/client'
import { inject, injectable } from "tsyringe";
import { z } from 'zod';
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import AppError from '@shared/errors/AppError';

const drinkSchema = z.object({
    name: z.string(),
    method: z.string(),
}) 

type Drink = z.infer<typeof drinkSchema>

@injectable()
class CreateDrinkService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository
    ) {}

    async execute(data:Drink): Promise<Drink> {
        
        const {name, method } = drinkSchema.parse(data)

        const drinkALreadyExists = await this.drinksRepository.findByName(name);        
        if (drinkALreadyExists.length === 1) {
            throw new AppError("Drink already exists!");            
        }

        const drink = await this.drinksRepository.create({name, method });

        return drink;
    }
}

export { CreateDrinkService };