import { LetterService } from "@letter/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {
  DispatchLetterDTO,
  GetLetterResponseDTO,
  GetLettersResponseDTO,
  GetUserInboxResponseDTO,
} from "@letter/dto/dto";
import { serialize } from "ts-data-object";

export class LetterController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(DispatchLetterDTO, req.body);
      await this.service.dispatchLetter(serialized);
      send(res, 201, { message: "Letter dispatched successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };

  get = async (req: Request, res: Response) => {
    try {
      const letterId = req.query.letterId as string;
      const response = await this.service.getLetter(letterId);
      send(res, 200, response, GetLetterResponseDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class GetAllLettersController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  get = async (req: Request, res: Response) => {
    try {
      const providerId = req.query.providerId as string;
      const response = await this.service.getAllLettersOfProvider(providerId);
      send(res, 200, { letters: response }, GetLettersResponseDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class SendLetterController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(DispatchLetterDTO, req.body);
      await this.service.dispatchLetter(serialized);
      send(res, 200, { message: "Letter dispatched successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class GetUserInboxController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  get = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const response = await this.service.getUserInbox(userId);
      send(res, 200, { letters: response }, GetUserInboxResponseDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
