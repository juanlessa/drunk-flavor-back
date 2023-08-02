const INGREDIENT_ERRORS = {
	not_exist: 'Ingredient does not exist',
	already_exist: 'Ingredient already exists',
	not_found: 'Ingredient not found',
	required_id: 'id is required',
	invalid_id_format: 'id invalid',
	required_name: 'name is required',
	invalid_name_format: 'name must have a minimum of 1 character',
	required_category_id: 'categoryId is required',
	invalid_category_id_format: 'categoryId invalid',
	required_unity_plural: 'unityPlural is required',
	invalid_unity_plural_format: 'unityPlural must have a minimum of 1 character',
	required_unity_singular: 'unitySingular is required',
	invalid_unity_singular_format: 'unitySingular must have a minimum of 1 character',
	required_is_alcoholic: 'isAlcoholic is required'
};

export { INGREDIENT_ERRORS };
