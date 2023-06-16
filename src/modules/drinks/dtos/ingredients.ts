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

interface IDeleteIngredient {
	id: string;
}
interface IGetIngredient {
	id: string;
}

export { ICreateIngredient, IUpdateIngredient, IDeleteIngredient, IGetIngredient };
