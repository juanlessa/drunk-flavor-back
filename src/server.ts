import { app } from "./shared/infra/fastify/app";
import { env } from "./env";

app
  .listen({
    host: "0.0.0.0",
    port: env.API_PORT,
  })
  .then(() => {
    console.log(`🚀 Server started on port ${env.API_PORT}`);
  });
