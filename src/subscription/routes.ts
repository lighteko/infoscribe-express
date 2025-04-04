import { Router } from "express";
import { authenticate } from "@middlewares/authentication";
import { SubscriptionController } from "./controller/controller";

export default function subscriptionRoutes() {
  const router = Router();

  const subscriptionController = new SubscriptionController();

  router.get("/", authenticate, subscriptionController.get);
  router.post("/subscribe", authenticate, subscriptionController.post);
  router.delete("/unsubscribe", authenticate, subscriptionController.delete);

  return router;
}
