import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../../../config/jwt";
export default async function CreateUserAdmin(req: FastifyRequest) {

  const userSchemaApp = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  const { name, email, password } = userSchemaApp.parse(req.body);

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const existUser = await prisma.admin.findUnique({
    where: {
      email: email,
    },
  })

  if(existUser){
    throw new Error("User already exists with this email");
  }

  const createUser = await prisma.admin.create({
    data: {
      name,
      email,
      password_hash: passwordHash,
      last_login_at: new Date(),
    },
  });

  if(!createUser){
    throw new Error("Failed to create user");
  }
 
  const createToken = jwt.sign({ userId: createUser?.id }, jwt_secret(), {
    expiresIn: "4d",
  });

  return {
    status: "success",
    message: "User created successfully",
    token: createToken,
  };
}
