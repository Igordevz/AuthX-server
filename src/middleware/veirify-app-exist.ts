import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma";

export async function verifyAppExist(req: FastifyRequest, reply: FastifyReply) {
  const appId = req.headers["app-id"];

  if (!appId || typeof appId !== "string") {
    return reply.status(400).send({ error: "Missing or invalid id in headers" });
  }

  const appProvider = await prisma.app_provider.findUnique({
    where: { id: appId },
  });

  if (!appProvider) {
    return reply.status(401).send({ error: "Invalid App Id" });
  }
}
