import { Router } from "express";

const routes = Router();
const repositories = [{name: "ola server"}];

routes.get("/repositories", (request, response) => {
    return response.json(repositories);
});

export default routes;