interface ICreateDrink {
	name: string;
	method: string;
	ingredients: {
		ingredientId: string;
		quantity: number;
	}[];
}
interface IUpdateDrink {
	id: string;
	name: string;
	method: string;
	cover?: string;
	thumbnail?: string;
	ingredients: {
		ingredientId: string;
		quantity: number;
	}[];
}
interface IUpdateDrinkCover {
	drinkId: string;
	coverFile: string;
}
interface IUpdateDrinkThumbnail {
	drinkId: string;
	thumbnailFile: string;
}

interface IDeleteDrink {
	id: string;
}

interface IGetDrink {
	id: string;
}

interface IDrinkResponse {
	id?: string;
	name: string;
	method: string;
	cover?: string;
	thumbnail?: string;
	created_at?: Date;
	ingredients: {
		ingredientId: string;
		quantity: number;
		name: string;
		unity: string;
		category: string;
		isAlcoholic: boolean;
		colorTheme: string;
		created_at?: Date;
	}[];
}

export {
	ICreateDrink,
	IUpdateDrink,
	IUpdateDrinkCover,
	IUpdateDrinkThumbnail,
	IDeleteDrink,
	IGetDrink,
	IDrinkResponse
};
