export enum USER_ERRORS {
	not_exist = 'User does not exist',
	already_exist = 'User already exists',
	required_id = 'id is required',
	invalid_id_format = 'id invalid',
	required_name = 'name is required',
	invalid_name_format = 'name must have a minimum of 1 character',
	required_surname = 'surname is required',
	invalid_surname_format = 'surname must have a minimum of 1 character',
	required_email = 'email is required',
	invalid_email_format = 'email invalid',
	required_password = 'password is required',
	invalid_password_format = 'password must have a minimum of 8 characters',
	required_role = 'role is required',
	invalid_role_format = 'role must be admin or partner'
}
