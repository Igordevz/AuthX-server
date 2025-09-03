import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../config/jwt";

export async function VerifyAdminUser(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const token = req.headers["jwt"];
  const appId = req.headers["app-id"];


  if (!token || typeof token !== "string") {
    return reply
      .status(400)
      .send({ error: "Missing or invalid jwt in headers" });
  }


  if (!appId || typeof appId !== "string") {
    return reply
      .status(400)
      .send({ error: "Missing or invalid project in headers" });
  }

  const descryptToken: any = jwt.verify(token, jwt_secret());

  if (!descryptToken) {
    throw new Error("Invalid token");
  }
  const getUser:any = await prisma.admin.findUnique({
    where: {
      id: descryptToken?.userId,
    },
    include: {
      app_providers:true
    }
  });

  const hasAccess = getUser?.app_providers?.some((app: any) => app.id === appId);
  if(!hasAccess) {
    return reply.status(404).send({ error: "You are not allowed to do this" });
  }
}
