import type { FastifyRequest } from "fastify";
import { z } from "zod"
import { prisma } from "../../config/prisma";
import crypto from 'crypto';

export default async function RemoveApp(req:FastifyRequest){

  const id:any = req.headers["app-id"]
  if(!id){
    throw new Error("App ID is required");
  }

  const removeApp = await prisma.app_provider.delete({
    where: {
      id: id,
    },
  })  

  
  if(!removeApp){
    throw new Error("Remove failed");
  }

  return {
    status: "success",
    message: "App provider delete successfully",
    data: removeApp,
  };

}