import { Router } from "express";
import {
  LoginController,
  RefreshTokenController,
  LogoutController,
} from "@auth/controller/controller";
import { authenticate } from "@src/middlewares/authentication";

const router = Router();

const loginController = new LoginController();
const refreshTokenController = new RefreshTokenController();
const logoutController = new LogoutController();

// Public routes - no authentication needed
router.post("/login", loginController.post);
router.post("/refresh", refreshTokenController.post);

// Protected routes - require authentication
router.post("/logout", authenticate, logoutController.post);

export default router; 