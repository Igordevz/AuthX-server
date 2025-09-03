import { prisma } from "../../config/prisma";

const ROLE_LIMITS = {
  free: 100,
  basic: 1000,
  pro: 10000,
} as const;

export default async function CountRequest(id: string, def: string) {
  const appId = id;
  if (!appId) throw new Error("App ID is required");

  const validateApp: any = await prisma.app_provider.findUnique({
    where: { id: appId },
    select: { 
      count_usage: true,
      last_reset_at: true,
      api_calls: true,
      admin: {
        select: {
          role: true,
          limit_of_days: true
        }
      }
    }
  });

  if (!validateApp) throw new Error("App not found");

  const adminRole = validateApp.admin.role as keyof typeof ROLE_LIMITS;
  const limitOfDays = validateApp.admin.limit_of_days;
  
  const weeklyLimit = ROLE_LIMITS[adminRole];
  
  const actualLimit = Math.min(weeklyLimit, limitOfDays);

  const now = new Date();
  const lastReset = new Date(validateApp.last_reset_at);
  
  const daysDifference = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

  let currentUsage = validateApp.count_usage;

  if (daysDifference >= 7) {
    currentUsage = 0;
    await prisma.app_provider.update({
      where: { id: appId },
      data: { count_usage: 0, last_reset_at: new Date() },
    });
  }

  const usageMap: Record<string, number> = {
    DELETE: 0.8,
    CREATE: 2,
    GET: 0.4,
    LOGIN: 0.6,
  };

  const usageCost = usageMap[def] || 0;

  if (currentUsage + usageCost > actualLimit) {
    throw new Error(`Weekly request limit of ${actualLimit} reached for ${adminRole} plan`);
  }

  await prisma.app_provider.update({
    where: { id: appId },
    data: {
      count_usage: currentUsage + usageCost,
      api_calls: validateApp.api_calls + 1,
    },
  });
}
