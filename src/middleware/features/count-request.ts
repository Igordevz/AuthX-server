import { prisma } from "../../config/prisma";

export default async function CountRequest(id: string, def: string) {
  const appId = id;
  if (!appId) throw new Error("App ID is required");

  const validateApp: any = await prisma.app_provider.findUnique({
    where: { id: appId },
  });

  if (!validateApp) throw new Error("App not found");

  const today = new Date().toISOString().split("T")[0];
  const lastReset = new Date(validateApp.last_reset_at)
    .toISOString()
    .split("T")[0];

  let currentUsage = validateApp.count_usage;

  if (today !== lastReset) {
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

  if (currentUsage + usageCost > 100) {
    throw new Error("Daily request limit of 100 reached");
  }

  await prisma.app_provider.update({
    where: { id: appId },
    data: {
      count_usage: currentUsage + usageCost,
      api_calls: validateApp.api_calls + 1,
    },
  });
}
