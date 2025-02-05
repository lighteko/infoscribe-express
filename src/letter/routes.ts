import { Router } from "express";
import {
  CreateLetterController,
  GetLetterController,
  SendLetterController,
} from "@letter/controller/controller";

const router = Router();

const createLetterController = new CreateLetterController();
const getLetterController = new GetLetterController();
const sendLetterController = new SendLetterController();

router.post("/", createLetterController.post);
router.get("/", getLetterController.get)
router.post("/dispatch", sendLetterController.post);

export default router;
