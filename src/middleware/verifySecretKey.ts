import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma";

export async function verifySecretKey(req: FastifyRequest, reply: FastifyReply) {
  const secretKey = req.headers["secret-key"];

  if (!secretKey || typeof secretKey !== "string") {
    return reply.status(400).send({ error: "Missing or invalid secret_key in headers" });
  }

  const appProvider = await prisma.app_provider.findUnique({
    where: { secret_key: secretKey },
  });

  if (!appProvider) {
    return reply.status(401).send({ error: "Invalid secret key" });
  }

  req.headers["validated-app-provider-id"] = appProvider.id;
}
