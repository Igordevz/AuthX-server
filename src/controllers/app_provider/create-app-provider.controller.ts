import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../../config/jwt";

export default async function CreateAppProvider(req: FastifyRequest, reply: FastifyReply) {
  const CreateAppProviderSchema = z.object({
    name_app: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),
  });

  if (!req.body) {
    return reply.status(400).send({ error: "Body is required" });
  }

  const { name_app, description} = CreateAppProviderSchema.parse(req.body);

  const token = req.headers["jwt"];
  if (!token || typeof token !== "string") {
    return reply.status(400).send({ error: "Missing or invalid jwt in headers" });
  }

  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, jwt_secret());
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }

  const admin = await prisma.admin.findUnique({ where: { id: decodedToken.userId } });
  if (!admin) {
    return reply.status(404).send({ error: "Admin not found" });
  }

  const rawSecret = crypto.randomBytes(32).toString("hex");
  const secretKey = `sk_${rawSecret}`;
  const publicKey = crypto.createHash("sha256").update(secretKey).digest("hex");

  let newApp;
  try {
    newApp = await prisma.app_provider.create({
      data: {
        name_app,
        description,
        owner_email: admin.email,
        public_key: publicKey,
        admin: { connect: { id: admin.id } },
      },
    });
  } catch (err) {
    return reply.status(500).send({
      status: "error",
      message: "Failed to create app provider",
      details: err instanceof Error ? err.message : err,
    });
  }

  return reply.status(201).send({
    status: "success",
    message: "App provider created successfully",
    data: newApp,
  });
}
