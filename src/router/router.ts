import type { FastifyInstance } from "fastify";
import CreateAppProvider from "../controllers/app_provider/create-app-provider.controller";
import RemoveApp from "../controllers/app_provider/remove-app.controller";
import CreateUserApp from "../controllers/app_provider/auth/create-user.controller";
import LoginUserApp from "../controllers/app_provider/auth/login.controller";
import { verifyKey } from "../middleware/veirify-key";
import getToken from "../controllers/app_provider/auth/get-token.controller";
import CreateUserAdmin from "../controllers/admin/auth/create-admin.controller";
import LoginAdmin from "../controllers/admin/auth/login-admin.controller";
import GetTokenAdmin from "../controllers/admin/auth/get-token-admin.controller";
import { VerifyAdminUser } from "../middleware/verify-admin-project";
import { VerifyAdminValid } from "../middleware/verify-admin-valid";
import GetData from "../controllers/admin/dashboard/get-data.controller";

export default async function CreateRouter(app:FastifyInstance) {

  app.get("/", () => {
    return "Welcome to the API!";
  })

  app.post("/create/app", { preHandler: VerifyAdminValid }, CreateAppProvider)
  app.delete("/delete/app", { preHandler: VerifyAdminUser }, RemoveApp)

  //router admin 
  app.post("/auth/register",  CreateUserAdmin)
  app.post("/auth/login", LoginAdmin)
  app.get("/token", GetTokenAdmin)
  app.get("/dashboard", GetData)

  // router to clientes
  app.post("/v1/auth/create", { preHandler: verifyKey },  CreateUserApp)
  app.post("/v1/auth/login", { preHandler: verifyKey }, LoginUserApp)
  app.get("/v1/token", getToken)
  // refresh token 
} 
