import { Router } from "express";
import {
  LetterController,
  SendLetterController,
} from "@letter/controller/controller";

export default function letterRoutes() {
  const router = Router();

  const letterController = new LetterController();
  const sendLetterController = new SendLetterController();

  router.post("/", letterController.post);
  router.get("/", letterController.get);
  router.post("/dispatch", sendLetterController.post);

  return router;
}
