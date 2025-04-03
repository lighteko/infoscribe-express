import { Router } from "express";
import {
  CreateSubscriptionController,
  GetAllProvidersController,
  ProviderController,
} from "@provider/controller/controller";
import { authenticate } from "@middlewares/authentication";

export default function providerRoutes() {
  const router = Router();

  const providerController = new ProviderController();
  const getAllProvidersController = new GetAllProvidersController();
  const createSubscriptionController = new CreateSubscriptionController();

  router.get("/", authenticate, providerController.get);
  router.get("/all", authenticate, getAllProvidersController.get);
  router.post("/create", authenticate, providerController.post);
  router.post("/subscribe", authenticate, createSubscriptionController.post);

  return router;
}
