import { inject, injectable } from "tsyringe";
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import {IDrinkResponse} from '@modules/drinks/dtos/DrinksDTO'


@injectable()
class ListDrinksService {
    constructor(
        @inject("DrinksRepository")
        private drinksRepository: IDrinksRepository,
    ) {}

    async execute(): Promise<IDrinkResponse[]> {    
        const drinks = await this.drinksRepository.findAllWithIngredientsDetails();  
        return drinks;
    }
}

export { ListDrinksService };