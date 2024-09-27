import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { getAppURL } from '../helpers/fastify.helpers';

const docsInfo = {
	title: 'DrunkFlavor Documentation',
	description:
		'Welcome to the DrunkFlavor API documentation! This page serves as a comprehensive reference for developers who want to integrate and leverage the functionality of our backend services. Our API follow the RESTful principles and provides a set of well-defined endpoints to access and manipulate data related to alcoholic drink recipes.',
	version: '1.0.0',
	contact: {
		name: 'Juan Lessa',
		email: 'juanvlessa@ua.pt',
	},
};

export const SWAGGER_OPTIONS = {
	openapi: {
		info: docsInfo,
		servers: [],
	},
} satisfies FastifyDynamicSwaggerOptions;

export const DOCS_ROUTE_PATH = '/documentation';
export const DOCS_URL = getAppURL().concat(DOCS_ROUTE_PATH);

export const SWAGGER_UI_OPTIONS = {
	routePrefix: DOCS_ROUTE_PATH,
};
