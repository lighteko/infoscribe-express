import { Router } from "express";
import { SubscriptionController } from "./controller/controller";

export default function subscriptionRoutes() {
  const router = Router();

  const subscriptionController = new SubscriptionController();

  router.get("/", subscriptionController.get);
  router.post("/subscribe", subscriptionController.post);
  router.delete("/unsubscribe", subscriptionController.delete);

  return router;
}
