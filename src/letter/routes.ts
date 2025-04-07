import { Router } from "express";
import {
  GetAllLettersController,
  GetUserInboxController,
  LetterController,
  SendLetterController,
} from "@letter/controller/controller";

export default function letterRoutes() {
  const router = Router();

  const letterController = new LetterController();
  const sendLetterController = new SendLetterController();
  const getAllLettersController = new GetAllLettersController();
  const getUserInboxController = new GetUserInboxController();

  router.post("/", letterController.post);
  router.get("/", letterController.get);
  router.get("/all", getAllLettersController.get);
  router.post("/dispatch", sendLetterController.post);
  router.get("/inbox", getUserInboxController.get);
  return router;
}
