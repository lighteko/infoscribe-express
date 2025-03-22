import { Router } from "express";
import { UserController } from "@user/controller/controller";

const router = Router();

const userController = new UserController();

router.get("/", userController.get);
router.put("/", userController.put);

export default router;
