import Category from '@modules/drinks/entities/Category';

type Ingredient = {
	id: string;
	name: string;
	unitySingular: string;
	unityPlural: string;
	categoryId: string;
	category?: Category;
	isAlcoholic: boolean;
	created_at: Date;
};

export default Ingredient;
