import { IDrinksRepository } from '@modules/drinks/repositories/drinks.repository.interface';
import { IDrink } from '@modules/drinks/entities/drink.entity';
import { ICreateDrink, IFindDrinkByName, IUpdateDrink } from '@modules/drinks/dtos/drink.dtos';
import { Drink } from '../entities/drink.model';
import { getNameCompareQuery } from '../utils/getNameCompareQuery';

class DrinksRepository implements IDrinksRepository {
	async create(data: ICreateDrink): Promise<IDrink> {
		const drink = new Drink(data);
		await drink.save();
		return drink;
	}

	async update({ id, ...data }: IUpdateDrink): Promise<IDrink> {
		return await Drink.findByIdAndUpdate<IDrink>({ _id: id }, { ...data }).exec();
	}

	async delete(id: string): Promise<IDrink> {
		return await Drink.findOneAndDelete<IDrink>({ _id: id }).exec();
	}

	async findByName(data: IFindDrinkByName): Promise<IDrink> {
		return await Drink.findOne<IDrink>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<IDrink> {
		return await Drink.findById<IDrink>(id).exec();
	}

	async findAll(): Promise<IDrink[]> {
		return await Drink.find<IDrink>().exec();
	}
}

export { DrinksRepository };
