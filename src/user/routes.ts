import { Router } from "express";
import {
  CreateUserController,
  GetUserController,
  UpdateUserController,
} from "@user/controller/controller";

const router = Router();

const getUserController = new GetUserController();
const createUserController = new CreateUserController();
const updateUserController = new UpdateUserController();

router.get("/", getUserController.get);
router.post("/", createUserController.post);
router.put("/", updateUserController.put);

export default router;
