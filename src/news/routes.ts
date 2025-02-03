import { Router } from "express";
import {
  CreateProviderController,
  CreateSubscriptionController,
  GetAllProvidersController,
  GetProviderController,
} from "@news/controller/controller";

const router = Router();

const getProviderController = new GetProviderController();
const getAllProvidersController = new GetAllProvidersController();
const createProviderController = new CreateProviderController();
const createSubscriptionController = new CreateSubscriptionController();

router.get("/", getProviderController.get);
router.get("/all", getAllProvidersController.get);
router.post("/", createProviderController.post);
router.post("/subscribe", createSubscriptionController.post);

export default router;
