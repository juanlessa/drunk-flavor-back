interface ICreateIngredient {
	name: string;
	unitySingular: string;
	unityPlural: string;
	categoryId: string;
	isAlcoholic: boolean;
}

interface IUpdateIngredient {
	id: string;
	name: string;
	unitySingular: string;
	unityPlural: string;
	categoryId: string;
	isAlcoholic: boolean;
}

interface IDeleteIngredient {
	id: string;
}

interface IGetIngredient {
	id: string;
}

export { ICreateIngredient, IUpdateIngredient, IDeleteIngredient, IGetIngredient };
