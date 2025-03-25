import { Router } from "express";
import {
  LoginController,
  RefreshTokenController,
  LogoutController,
  SignupController,
  EmailVerificationController,
} from "@auth/controller/controller";
import { authenticate } from "@src/middlewares/authentication";

export default function authRoutes() {
  const router = Router();

  const signupController = new SignupController();
  const loginController = new LoginController();
  const refreshTokenController = new RefreshTokenController();
  const logoutController = new LogoutController();
  const emailVerificationController = new EmailVerificationController();

  // Public routes - no authentication needed
  router.post("/signup", signupController.post);
  router.post("/login", loginController.post);
  router.post("/refresh", refreshTokenController.post);
  router.get("/verify", emailVerificationController.get);

  // Protected routes - require authentication
  router.post("/logout", authenticate, logoutController.post);
  return router;
}
