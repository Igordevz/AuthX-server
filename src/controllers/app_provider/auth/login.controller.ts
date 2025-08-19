import type { FastifyRequest } from "fastify";
import { z } from "zod"
import { prisma } from "../../../config/prisma";
import bcrypt from "bcrypt"
import jwt  from "jsonwebtoken";
import { jwt_secret } from "../../../config/jwt";
export default async function LoginUserApp(req:FastifyRequest){

  const userSchema = z.object({
    email: z.string().email("Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  const { email, password } = userSchema.parse(req.body);

  const appId:any = req.headers["app-id"];

  const user:any = await prisma.admin.findUnique({
    where: {
      email: email,
    },  
    select: {
      id: true,
      name: true,
      createdAt: true,
      email: true,
      email_verified: true,
      is_active: true, 
      last_login_at: true,
      updatedAt: true,
      password_hash: true
    }
  })

  const analysePassword = await bcrypt.compare(password, user?.password_hash);

  if(!user || !analysePassword){
    throw new Error("Invalid email or password");
  }
  
  // Update last login time
  await prisma.admin.update({
    where: {
      id: user.id,
    },
    
    data: {
      last_login_at: new Date(),
      app_provider: {
        connect: {
          id: appId
        }
      }
    },
  });


  const createToken = jwt.sign({ userId: user?.id }, jwt_secret(), {
    expiresIn: "4d",
  });

  return {

    status: "success",
    message: "Login successful",
    token: createToken
  };  

}

