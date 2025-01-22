import { Router } from "express";
import {
  CreateUserController,
  GetUserController,
} from "./controller/controller";

const router = Router();

const getUserController = new GetUserController();
const createUserController = new CreateUserController();

router.get("/", getUserController.get);
router.post("/", createUserController.post);

export default router;
