import { ProviderService } from "@provider/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { serialize } from "ts-data-object";
import {
  CreateProviderDTO,
  GetAllProvidersResponseDTO,
  GetProviderResponseDTO,
} from "@provider/dto/dto";

export class ProviderController {
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

  post = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const serialized = await serialize(CreateProviderDTO, {
        ...req.body,
        userId: user.userId,
      });
      await this.service.createProvider(serialized);
      send(res, 201, { message: "Provider created successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const providerId = req.query.providerId as string;
      const user = (req as any).user;
      await this.service.deleteProvider(user.userId, providerId);
      send(res, 200, { message: "Provider removed successfully" });
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

  get = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const response = await this.service.getAllProvidersOfUser(user.userId);
      send(res, 200, response, GetAllProvidersResponseDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class GetAllSubscribableProviders {
  service: ProviderService;

  constructor() {
    this.service = new ProviderService();
  }

  get = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const response = await this.service.getAllSubscribableProviders(
        user.userId
      );
      send(res, 200, response, GetAllProvidersResponseDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
