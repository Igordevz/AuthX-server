import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma";

export async function verifyAppExist(req: FastifyRequest, reply: FastifyReply) {
  const appId = req.headers["app-id"];
  const public_key = req.headers["public-key"];

  if (!public_key || typeof public_key !== "string") {
    return reply.status(400).send({ error: "Missing or invalid public key in headers" });
  }

  if (!appId || typeof appId !== "string") {
    return reply.status(400).send({ error: "Missing or invalid id in headers" });
  }

  const appProvider = await prisma.app_provider.findUnique({
    where: { id: appId },
  });

  if(appProvider?.public_key !== public_key) {
    return reply.status(401).send({ error: "Invalid public key" });
  }
  
  if (!appProvider) {
    return reply.status(401).send({ error: "Invalid App Id" });
  }
}
