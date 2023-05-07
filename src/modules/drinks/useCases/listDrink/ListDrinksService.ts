import { Prisma } from '@prisma/client'
import { inject, injectable } from "tsyringe";
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";


type Drink = Prisma.DrinkCreateInput

@injectable()
class ListDrinksService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository
    ) {}

    async execute(): Promise<Drink[]> {    
        const drinks = await this.drinksRepository.findAll();        
    
        return drinks;
    }
}

export { ListDrinksService };