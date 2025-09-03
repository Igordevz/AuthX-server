import type { FastifyRequest } from "fastify";
import { z } from "zod"
import jwt from "jsonwebtoken";
import { jwt_secret } from "../../../config/jwt";
import { prisma } from "../../../config/prisma";
import CountRequest from "../../../middleware/features/count-request";
export default async function getToken(req:FastifyRequest) {

  const token:any = req.headers["jwt"];
  const appId:any = req.headers["app-id"];

  const descryptToken:any = jwt.verify(token, jwt_secret())

  if(!descryptToken) {
    throw new Error("Invalid token")
  }

  
  const getUser = await prisma.users_app.findUnique({
    where: {
      id: descryptToken?.userId 
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
      password_hash: true,
    }
  })

  if(!getUser) {
    throw new Error("User not found")
  }
  
  await CountRequest(appId, "GET")

  return {
    status: "success",
    message: "Login successful",
    token: getUser
  };  

}