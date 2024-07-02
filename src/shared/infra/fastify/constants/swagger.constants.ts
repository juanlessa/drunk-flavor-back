import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";

const docsInfo = {
  title: "DrunkFlavor Documentation",
  description:
    "Welcome to the DrunkFlavor API documentation! This page serves as a comprehensive reference for developers who want to integrate and leverage the functionality of our backend services. Our API follow the RESTful principles and provides a set of well-defined endpoints to access and manipulate data related to alcoholic drink recipes.",
  version: "1.0.0",
  contact: {
    name: "Juan Lessa",
    email: "juanvlessa@ua.pt",
  },
};

export const SWAGGER_OPTIONS = {
  openapi: {
    info: docsInfo,
    servers: [],
  },
} as const satisfies FastifyDynamicSwaggerOptions;
