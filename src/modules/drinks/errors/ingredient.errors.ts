export enum INGREDIENT_ERRORS {
	not_exist = 'Ingredient does not exist',
	already_exist = 'Ingredient already exists',
	not_found = 'Ingredient not found',
	required_id = 'id is required',
	invalid_id_format = 'id invalid',
	required_name = 'name is required',
	invalid_name_format = 'name must have a minimum of 1 character',
	required_category = 'category is required',
	invalid_category_format = 'category invalid',
	required_unit = 'uni is required',
	invalid_unit_format = 'unit must have a minimum of 1 character',
	required_unit_plural = 'unit plural is required',
	invalid_unit_plural_format = 'unit plural must have a minimum of 1 character',
	required_is_alcoholic = 'is alcoholic field is required'
}
