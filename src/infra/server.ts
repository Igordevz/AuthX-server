import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import CreateRouter from "../router/router";

const app = fastify({
  logger: false, 
});

// Register CORS
app.register(fastifyCors, {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "jwt", "*"],
});

// Register routes
app.register(CreateRouter);

app.listen({
  port: 3333,
}).then(() => {
  console.log(`Http server running 🔥 -> http://localhost:3333`);
});