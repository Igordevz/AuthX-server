import type { FastifyRequest } from "fastify";
import { jwt_secret } from "../../../config/jwt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/prisma";

export default async function GetDashboardData(req: FastifyRequest) {
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

  const ROLE_LIMITS = {
    free: 100,
    basic: 1000,
    pro: 10000,
  } as const;
  
  const adminData = await prisma.admin.findUnique({
    where: { id: decodedToken?.userId },
    include: {
      app_providers: {
        include: {
          users: true,
        },
      },
    },
  });
  const weeklyLimit =
    ROLE_LIMITS[adminData?.role as keyof typeof ROLE_LIMITS] ?? 0;
  
  if (!adminData) {
    throw new Error("Admin not found");
  }

  // Métricas gerais
  const activeProjects = adminData.app_providers.length;
  const totalUsers = adminData.app_providers.reduce(
    (acc, provider) => acc + (provider.users?.length || 0),
    0
  );
  const totalApiCalls = adminData.app_providers.reduce(
    (acc, provider) => acc + (provider.api_calls || 0),
    0
  );
  const apiCallsToday = adminData.app_providers.reduce(
    (acc, provider) => acc + (provider.count_usage || 0),
    0
  );

  // Dados para gráficos
  const apiUsageByApp = adminData.app_providers.map((app) => ({
    appName: app.name_app,
    apiCalls: app.api_calls || 0,
  }));

  const usersByApp = adminData.app_providers.map((app) => ({
    appName: app.name_app,
    userCount: app.users.length,
  }));

  const emailVerificationStats = {
    verified: adminData.app_providers.reduce(
      (acc, app) =>
        acc + app.users.filter((user) => user.email_verified).length,
      0
    ),
    unverified: adminData.app_providers.reduce(
      (acc, app) =>
        acc + app.users.filter((user) => !user.email_verified).length,
      0
    ),
  };


  return {
    metrics: {
      maxRequests: weeklyLimit,
      activeProjects: activeProjects,
      totalUsers: totalUsers,
      totalApiCalls: totalApiCalls,
      apiCallsToday: apiCallsToday,
    },
    charts: {
      apiUsageByApp: apiUsageByApp,
      usersByApp: usersByApp,
      emailVerification: emailVerificationStats,
    },
    bruteData: adminData,
  };
}
