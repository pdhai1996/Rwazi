import { authService } from "@src/services/AuthService";
import { IReq } from "./common/types";
import { Router } from "express";
import { authController } from "@src/controllers/AuthController";

const authRouter = Router();

authRouter.post("/login", authController.login);

export { authRouter };