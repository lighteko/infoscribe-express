import { Router } from "express";
import { UserController } from "@user/controller/controller";

export default function userRoutes() {
  const router = Router();

  const userController = new UserController();

  router.get("/", userController.get);
  router.put("/", userController.put);

  return router;
}
