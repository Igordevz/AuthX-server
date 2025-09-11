import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma";

export async function verifyKey(req: FastifyRequest, reply: FastifyReply) {
  const public_key = req.headers["public-key"];

  if (!public_key || typeof public_key !== "string") {
    return reply.status(400).send({ error: "Missing or invalid public key in headers" });
  }

  const appProvider = await prisma.app_provider.findUnique({
    where: { public_key: public_key },
  });

  if(!appProvider) {
    return reply.status(401).send({ error: "Invalid public key" });
  }

}
