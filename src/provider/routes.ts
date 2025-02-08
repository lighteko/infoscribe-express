import { Router } from "express";
import {
  CreateSubscriptionController,
  GetAllProvidersController,
  ProviderController,
} from "@provider/controller/controller";

const router = Router();

const providerController = new ProviderController();
const getAllProvidersController = new GetAllProvidersController();
const createSubscriptionController = new CreateSubscriptionController();

router.get("/", providerController.get);
router.get("/all", getAllProvidersController.get);
router.post("/", providerController.post);
router.post("/subscribe", createSubscriptionController.post);

export default router;
