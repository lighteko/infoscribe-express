import { Router } from "express";
import {
  GetAllProvidersController,
  GetAllSubscribableProviders,
  ProviderController,
} from "@provider/controller/controller";

export default function providerRoutes() {
  const router = Router();

  const providerController = new ProviderController();
  const getAllProvidersController = new GetAllProvidersController();
  const getAllSubscribableProviders = new GetAllSubscribableProviders();

  router.get("/", providerController.get);
  router.get("/all", getAllProvidersController.get);
  router.get("/subscribable", getAllSubscribableProviders.get);
  router.post("/create", providerController.post);
  router.delete("/", providerController.delete);

  return router;
}
