import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../../../config/jwt";
import CountRequest from "../../../middleware/features/count-request";
export default async function CreateUserApp(req: FastifyRequest) {

  const appId:any = req.headers["app-id"];

  const userSchemaApp = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  const { name, email, password } = userSchemaApp.parse(req.body);

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const existUser = await prisma.users_app.findUnique({
    where: {
      email: email,
    },
  })

  if(existUser){
    throw new Error("User already exists with this email");
  }

  const createUser = await prisma.users_app.create({
    data: {
      name,
      email,
      password_hash: passwordHash,
      last_login_at: new Date(),
        app_provider: {
          connect: { id: appId }
        },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      email: true,
      email_verified: true,
      is_active: true, 
      last_login_at: true,
      updatedAt: true
    }
  });

  if(!createUser){
    throw new Error("Failed to create user");
  }
 
  const currentApp:any = await prisma.admin.findUnique({
    where: { id: appId },
  })
  const createToken = jwt.sign({ userId: createUser?.id }, jwt_secret(), {
    expiresIn: "4d",
  });

  await CountRequest(appId, "CREATE");

  return {
    status: "success",
    message: "User created successfully",
    token: createToken,
  };
}
