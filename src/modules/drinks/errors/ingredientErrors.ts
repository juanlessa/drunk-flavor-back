const INGREDIENT_ERRORS = {
	not_exist: 'Ingredient does not exist',
	already_exist: 'Ingredient already exists',
	not_found: 'Ingredient not found',
	required_id: 'id is required',
	invalid_id_format: 'id invalid',
	required_name: 'name is required',
	invalid_name_format: 'name must have a minimum of 1 character',
	required_category: 'category is required',
	invalid_category_format: 'category must have a minimum of 1 character',
	required_unity: 'unity is required',
	invalid_unity_format: 'unity must have a minimum of 1 character',
	required_color_theme: 'colorTheme is required',
	invalid_color_theme_format: 'colorTheme must be a Hex color like #aabbcc',
	required_is_alcoholic: 'isAlcoholic is required'
};

export { INGREDIENT_ERRORS };
