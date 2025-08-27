import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/prisma";
import { jwt_secret } from "../../../config/jwt";

export default async function GetTokenAdmin(req: FastifyRequest) {
  const token: any = req.headers["jwt"];

  if (!token || typeof token !== "string") {
    throw new Error("Token not provided or invalid");
  }

  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, jwt_secret());
  } catch (err) {
    throw new Error("Invalid or expired token");
  }

  const getUser = await prisma.admin.findUnique({
    where: { id: decodedToken.userId },
    select: {
      id: true,
      name: true,
      email: true,
      email_verified: true,
      is_active: true,
      last_login_at: true,
      createdAt: true,
      updatedAt: true,
   
      app_providers: {
        select: {
          id: true,
          name_app: true,
          public_key: true,
          createdAt: true,
        },
      },
    },
  });

  if (!getUser) {
    throw new Error("User not found");
  }

  return {
    status: "success",
    message: "Login successful",
    data: getUser,
  };
}
