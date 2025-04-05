import { Router } from "express";
import {
  GetAllProvidersController,
  GetAllSubscribableProviders,
  ProviderController,
} from "@provider/controller/controller";
import { authenticate } from "@middlewares/authentication";

export default function providerRoutes() {
  const router = Router();

  const providerController = new ProviderController();
  const getAllProvidersController = new GetAllProvidersController();
  const getAllSubscribableProviders = new GetAllSubscribableProviders();

  router.get("/", authenticate, providerController.get);
  router.get("/all", authenticate, getAllProvidersController.get);
  router.get("/subscribable", authenticate, getAllSubscribableProviders.get);
  router.post("/create", authenticate, providerController.post);
  router.delete("/", authenticate, providerController.delete);

  return router;
}
