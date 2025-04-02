import { Router } from "express";
import {
  CreateSubscriptionController,
  GetAllProvidersController,
  ProviderController,
} from "@provider/controller/controller";

export default function providerRoutes() {
  const router = Router();

  const providerController = new ProviderController();
  const getAllProvidersController = new GetAllProvidersController();
  const createSubscriptionController = new CreateSubscriptionController();

  router.get("/", providerController.get);
  router.get("/all", getAllProvidersController.get);
  router.post("/create", providerController.post);
  router.post("/subscribe", createSubscriptionController.post);

  return router;
}
