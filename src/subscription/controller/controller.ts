import { SubscriptionService } from "@subscription/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { GetAllSubscriptionOfUserDTO } from "@subscription/dto/dto";

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

  delete = async (req: Request, res: Response) => {
    try {
      const subscriptionId = req.query.subscriptionId as string;
      await this.service.deleteSubscription(subscriptionId);
      send(res, 200, { message: "Subscription deleted successfully." });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
