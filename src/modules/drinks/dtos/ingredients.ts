interface ICreateIngredient {
	name: string;
	unity: string;
	category: string;
	isAlcoholic: boolean;
	colorTheme: string;
}
interface IUpdateIngredient {
	id: string;
	name: string;
	unity: string;
	category: string;
	isAlcoholic: boolean;
	colorTheme: string;
}

export { ICreateIngredient, IUpdateIngredient };
