import type { FastifyRequest } from "fastify";
import { z } from "zod"
import { prisma } from "../../../config/prisma";
import bcrypt from "bcrypt"
import jwt  from "jsonwebtoken";
import { jwt_secret } from "../../../config/jwt";
import CountRequest from "../../../middleware/features/count-request";
export default async function LoginUserApp(req:FastifyRequest){

  const userSchema = z.object({
    email: z.string().email("Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  const { email, password } = userSchema.parse(req.body);

  const public_key:any = req.headers["public-key"];

  const user:any = await prisma.users_app.findFirst({ // Changed to users_app and findFirst
    where: {
      email: email,
      public_key: public_key // Added public_key to where clause
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

  if(!user){
    throw new Error("Invalid email or password");
  }
  const analysePassword = await bcrypt.compare(password, user.password_hash);

  if(!analysePassword){
    throw new Error("Invalid email or password");
  }
  
  // Update last login time
  await prisma.users_app.update({ // Changed to users_app
    where: {
      id: user.id,
    },
    
    data: {
      last_login_at: new Date(),
      // Removed app_providers connect as it's already set during creation
    },
  });


  const createToken = jwt.sign({ userId: user?.id }, jwt_secret(), {
    expiresIn: "4d",
  });

  await CountRequest(public_key, "LOGIN")

  return {

    status: "success",
    message: "Login successful",
    token: createToken
  };  

}

