import { ProviderService } from "@provider/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {} from "@provider/service/service";
import { serialize } from "ts-data-object";
import {
  CreateProviderDTO,
  CreateSubscriptionDTO,
  GetAllProvidersResponseDTO,
  GetProviderResponseDTO,
} from "@provider/dto/dto";

export class GetProviderController {
  service: ProviderService;

  constructor() {
    this.service = new ProviderService();
  }

  get = async (req: Request, res: Response) => {
    try {
      const providerId = req.query.providerId as string;
      if (!providerId) {
        abort(res, 400, "'providerId' was not given through query string");
        return;
      }
      const response = await this.service.getProvider(providerId);
      send(res, 200, response, GetProviderResponseDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class GetAllProvidersController {
  service: ProviderService;

  constructor() {
    this.service = new ProviderService();
  }

  get = async (_: Request, res: Response) => {
    try {
      const response = await this.service.getAllProviders();
      send(res, 200, response, GetAllProvidersResponseDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class CreateProviderController {
  service: ProviderService;

  constructor() {
    this.service = new ProviderService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(CreateProviderDTO, req.body);
      await this.service.createProvider(serialized);
      send(res, 201, { message: "User created successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class CreateSubscriptionController {
  service: ProviderService;

  constructor() {
    this.service = new ProviderService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(CreateSubscriptionDTO, req.body);
      await this.service.createSubscription(serialized);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
