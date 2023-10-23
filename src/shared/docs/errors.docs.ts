export const docsAppErrorDefinition = {
	type: 'object',
	properties: {
		status: {
			type: 'string'
		},
		message: {
			type: 'string'
		}
	},
	example: {
		status: 'error',
		message: 'a description of the error'
	}
};
