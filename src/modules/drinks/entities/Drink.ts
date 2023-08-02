import Ingredient from './Ingredient';

type Drink = {
	id: string;
	name: string;
	method: string;
	cover: string;
	thumbnail: string;
	ingredients?: DrinkIngredients[];
	created_at: Date;
};

type DrinkIngredients = {
	id?: string;
	drink?: Drink;
	drinkId?: string;
	ingredient?: Ingredient;
	ingredientId?: string;
	quantity: number;
};

export default Drink;
