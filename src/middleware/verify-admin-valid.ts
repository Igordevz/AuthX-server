import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../config/jwt";

export async function VerifyAdminValid(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const token = req.headers["jwt"];


  if (!token || typeof token !== "string") {
    return reply
      .status(400)
      .send({ error: "Missing or invalid jwt in headers" });
  }
  const descryptToken: any = jwt.verify(token, jwt_secret());

  if (!descryptToken) {
    throw new Error("Invalid token");
  }

  const getUser = await prisma.admin.findUnique({
    where: {
      id: descryptToken?.userId,
    },
    include: {
      app_providers: true, 
    },
  });

  if(!getUser) {
    return reply.status(404).send({ error: "You are not allowed to do this" });
  }
}
