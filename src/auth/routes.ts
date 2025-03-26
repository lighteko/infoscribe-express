import { Router } from "express";
import {
  LoginController,
  RefreshTokenController,
  LogoutController,
  SignupController,
  EmailVerificationController,
  PasswordResetController,
} from "@auth/controller/controller";
import { authenticate } from "@src/middlewares/authentication";

export default function authRoutes() {
  const router = Router();

  const signupController = new SignupController();
  const loginController = new LoginController();
  const refreshTokenController = new RefreshTokenController();
  const logoutController = new LogoutController();
  const emailVerificationController = new EmailVerificationController();
  const passwordResetController = new PasswordResetController();

  // Public routes - no authentication needed
  router.post("/signup", signupController.post);
  router.post("/login", loginController.post);
  router.post("/refresh", refreshTokenController.post);
  router.post("/verify", emailVerificationController.post);
  router.post("/reset-password", passwordResetController.post);
  router.patch("/reset-password", passwordResetController.patch);

  // Protected routes - require authentication
  router.post("/logout", authenticate, logoutController.post);
  return router;
}
