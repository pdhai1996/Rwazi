import { authService } from "@src/services/AuthService";
import { IReq } from "./common/types";
import { Router } from "express";
import { authController } from "@src/controllers/AuthController";
import { authValidator } from "@src/validators/AuthValidator";

const authRouter = Router();

authRouter.post("/login", authValidator.login, authController.login);

export { authRouter };