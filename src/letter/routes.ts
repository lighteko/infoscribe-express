import { Router } from "express";
import { LetterController, SendLetterController } from "@letter/controller/controller";

const router = Router();

const letterController = new LetterController();
const sendLetterController = new SendLetterController();

router.post("/", letterController.post);
router.get("/", letterController.get);
router.post("/dispatch", sendLetterController.post);

export default router;
