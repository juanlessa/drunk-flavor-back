type Drink = {
	id: string;
	name: string;
	method: string;
	cover: string;
	thumbnail: string;
	ingredients: {
		ingredientId: string;
		quantity: number;
	}[];
	created_at: Date;
};

export default Drink;
