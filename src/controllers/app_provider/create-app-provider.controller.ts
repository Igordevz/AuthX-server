import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod"
import { prisma } from "../../config/prisma";
import crypto from 'crypto';
import { jwt_secret } from "../../config/jwt";
import jwt from "jsonwebtoken"
export default async function CreateAppProvider(req:FastifyRequest, reply:FastifyReply){

  const CreateAppProviderSchema = z.object({
    name_app: z.string().min(1, "Name is required"),
    onwer_email: z.string().email("Invalid email format"),
  })

  const { name_app, onwer_email  } = CreateAppProviderSchema.parse(req.body);
  const rawSecret = crypto.randomBytes(32).toString('hex'); 

  const secretKey = `sk_${rawSecret}`;
  const publicKey = crypto.createHash('sha256').update(secretKey).digest('hex');

  const token = req.headers["jwt"];


  if (!token || typeof token !== "string") {
    return reply
      .status(400)
      .send({ error: "Missing or invalid jwt in headers" });
  }
  const descryptToken: any = jwt.verify(token, jwt_secret());

  const createApp = await prisma.app_provider.create({
    data: {
      public_key: publicKey,
      secret_key: secretKey,
      name_app: name_app,
      onwer_email: onwer_email,
      admin: {
        connect: {
          id: descryptToken?.userId,
        }
      }
    },
    
  })

  if(!createApp){
    throw new Error("Creation failed");
  }

  return {
    status: "success",
    message: "App provider created successfully",
    data: createApp,
  };

}