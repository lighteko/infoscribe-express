import { SubscriptionService } from "@subscription/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {
  CreateSubscriptionDTO,
  GetAllSubscriptionOfUserDTO,
} from "@subscription/dto/dto";
import { serialize } from "ts-data-object";

export class SubscriptionController {
  service: SubscriptionService;
  constructor() {
    this.service = new SubscriptionService();
  }

  get = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const response = await this.service.getAllSubscriptionOfUser(user.userId);
      send(res, 200, response, GetAllSubscriptionOfUserDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };

  post = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const serialized = await serialize(CreateSubscriptionDTO, {
        userId: user.userId,
        ...req.body,
      });
      await this.service.createSubscription(serialized);
      send(res, 201, { message: "Subscription created successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const providerId = req.query.providerId as string;
      const user = (req as any).user;
      await this.service.deleteSubscription(providerId, user.userId);
      send(res, 200, { message: "Subscription deleted successfully." });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
